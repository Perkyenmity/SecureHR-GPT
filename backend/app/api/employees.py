
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Employee, User
from app.core.security import get_current_user
from app.permissions.engine import get_allowed_fields
from app.audit.logger import log_access_attempt


router = APIRouter(
    prefix="/employees",
    tags=["Employee Records"]
)


@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the requested employee
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # Check which fields the current user is allowed to access
    allowed_fields = get_allowed_fields(
        db,
        current_user,
        employee_id
    )

    # Log and reject unauthorized access
    if not allowed_fields:
        log_access_attempt(
            db=db,
            user=current_user,
            action="VIEW_EMPLOYEE",
            query=f"employee_id={employee_id}",
            decision="BLOCKED",
            reason="User does not have permission to access this employee record",
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this employee record"
        )

    # Return only permitted fields
    employee_data = {
        field: getattr(employee, field)
        for field in allowed_fields
    }

    # Log successful access
    log_access_attempt(
        db=db,
        user=current_user,
        action="VIEW_EMPLOYEE",
        query=f"employee_id={employee_id}",
        decision="ALLOWED",
        reason="User successfully accessed the employee record",
    )

    return employee_data
