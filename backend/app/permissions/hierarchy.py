
from sqlalchemy.orm import Session

from app.db.models import Employee


def is_in_reporting_hierarchy(
    db: Session,
    manager_employee_id: int,
    target_employee_id: int,
) -> bool:
    """
    Return True if target_employee_id reports directly or indirectly
    to manager_employee_id.

    A manager's own record is handled separately by the permission engine.
    """

    if manager_employee_id == target_employee_id:
        return False

    employees = db.query(Employee.id, Employee.manager_id).all()

    # Build an employee-to-manager lookup for efficient traversal.
    manager_lookup = {
        employee_id: manager_id
        for employee_id, manager_id in employees
    }

    if target_employee_id not in manager_lookup:
        return False

    visited = set()
    current_id = target_employee_id

    # Walk upward from the target employee to their manager.
    while current_id is not None:
        if current_id in visited:
            # Prevent infinite loops if the hierarchy contains a cycle.
            return False

        visited.add(current_id)
        current_id = manager_lookup.get(current_id)

        if current_id == manager_employee_id:
            return True

    return False
