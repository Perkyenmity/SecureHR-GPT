
from sqlalchemy.orm import Session

from app.db.models import Employee, User
from app.permissions.engine import get_allowed_fields
from app.audit.logger import log_access_attempt


def get_employee_data(
    db: Session,
    current_user: User,
    employee_id: int,
    requested_fields: list[str] | None = None,
) -> dict:
    """
    Fetch employee information after checking the authenticated
    user's role, reporting hierarchy and field-level permissions.
    """

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        log_access_attempt(
            db=db,
            user=current_user,
            action="VIEW_EMPLOYEE",
            query=f"employee_id={employee_id}",
            decision="BLOCKED",
            reason="Employee not found",
        )
        return {"error": "Employee not found"}

    allowed_fields = get_allowed_fields(
        db,
        current_user,
        employee_id,
    )

    if not allowed_fields:
        log_access_attempt(
            db=db,
            user=current_user,
            action="VIEW_EMPLOYEE",
            query=f"employee_id={employee_id}",
            decision="BLOCKED",
            reason="User does not have permission to access this employee",
        )
        return {"error": "Access denied"}

    # Never allow the caller to request fields outside their permissions.
    if requested_fields:
        selected_fields = [
        field for field in requested_fields
        if field in allowed_fields
    ]

    if not selected_fields:
        log_access_attempt(
            db=db,
            user=current_user,
            action="VIEW_EMPLOYEE",
            query=f"employee_id={employee_id}; fields={requested_fields}",
            decision="BLOCKED",
            reason="User does not have permission to access the requested fields",
        )
        return {"error": "Access denied: You cannot view the requested fields."}
    
    else:
        selected_fields = allowed_fields

    result = {
        field: getattr(employee, field)
        for field in selected_fields
    }

    log_access_attempt(
        db=db,
        user=current_user,
        action="VIEW_EMPLOYEE",
        query=f"employee_id={employee_id}; fields={selected_fields}",
        decision="ALLOWED",
        reason="Employee data accessed successfully",
    )

    return result


def get_employee_profile(
    db: Session,
    current_user: User,
    employee_id: int,
) -> dict:
    """Get permitted basic employee profile information."""

    return get_employee_data(
        db,
        current_user,
        employee_id,
        ["id", "name", "email", "department", "title", "manager_id", "hire_date"],
    )


def get_leave_balance(
    db: Session,
    current_user: User,
    employee_id: int,
) -> dict:
    """Get permitted employee leave information."""

    return get_employee_data(
        db,
        current_user,
        employee_id,
        ["leave_balance", "leave_taken", "sick_leave_balance", "sick_leave_taken"],
    )


def get_employee_salary(
    db: Session,
    current_user: User,
    employee_id: int,
) -> dict:
    """Get salary only when the permission rules allow it."""

    return get_employee_data(
        db,
        current_user,
        employee_id,
        ["salary"],
    )


def get_performance_rating(
    db: Session,
    current_user: User,
    employee_id: int,
) -> dict:
    """Get permitted employee performance rating."""

    return get_employee_data(
        db,
        current_user,
        employee_id,
        ["performance_rating"],
    )


def get_reporting_hierarchy(
    db: Session,
    current_user: User,
) -> dict:
    """Get employees in the authenticated manager's reporting hierarchy."""

    if (current_user.role or "").lower() != "manager":
        return {"error": "Access denied"}

    manager_id = current_user.employee_id

    if manager_id is None:
        return {"error": "Access denied"}

    employees = (
        db.query(Employee)
        .filter(Employee.id != manager_id)
        .all()
    )

    results = []

    for employee in employees:
        allowed_fields = get_allowed_fields(
            db,
            current_user,
            employee.id,
        )

        if allowed_fields:
            results.append({
                field: getattr(employee, field)
                for field in allowed_fields
                if field in ["id", "name", "department", "title", "manager_id"]
            })

    log_access_attempt(
        db=db,
        user=current_user,
        action="VIEW_REPORTING_HIERARCHY",
        query="reporting hierarchy",
        decision="ALLOWED",
        reason="Reporting hierarchy accessed",
    )

    return {"employees": results}


def search_employees(
    db: Session,
    current_user: User,
    search_term: str,
) -> dict:
    """Search employee names and return only permitted information."""

    if not search_term or not search_term.strip():
        return {"error": "Search term cannot be empty"}

    employees = (
        db.query(Employee)
        .filter(Employee.name.ilike(f"%{search_term.strip()}%"))
        .limit(20)
        .all()
    )

    results = []

    for employee in employees:
        data = get_employee_data(
            db,
            current_user,
            employee.id,
            ["id", "name", "department", "title"],
        )

        if "error" not in data:
            results.append(data)

    return {"employees": results}
