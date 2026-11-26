
from pathlib import Path

import yaml
from sqlalchemy.orm import Session

from app.db.models import Employee, User
from app.permissions.hierarchy import is_in_reporting_hierarchy


# Load field permissions once when the module is imported.
RULES_PATH = Path(__file__).with_name("field_rules.yaml")

with RULES_PATH.open("r", encoding="utf-8") as file:
    FIELD_RULES = yaml.safe_load(file)["roles"]


def get_allowed_fields(
    db: Session,
    user: User,
    target_employee_id: int,
) -> list[str]:
    """
    Return the fields the user is allowed to access.

    Returns an empty list when access is denied.
    """

    role = (user.role or "").lower()
    user_employee_id = user.employee_id

    # Reject unknown roles and users without an employee identity.
    if role not in FIELD_RULES or user_employee_id is None:
        return []

    # Confirm that the requested employee record exists.
    target_exists = (
        db.query(Employee.id)
        .filter(Employee.id == target_employee_id)
        .first()
    )

    if target_exists is None:
        return []

    is_self = user_employee_id == target_employee_id

    # Employees and admins can access only their own records.
    if role in {"employee", "admin"} and not is_self:
        return []

    # Managers can access their own records and their reporting hierarchy.
    if role == "manager" and not is_self:
        if not is_in_reporting_hierarchy(
            db,
            user_employee_id,
            target_employee_id,
        ):
            return []

    # HR can access any existing employee record.
    rules = FIELD_RULES[role]

    if is_self:
        return rules.get("self_fields", [])

    return rules.get("subordinate_fields", [])


def can_access_employee(
    db: Session,
    user: User,
    target_employee_id: int,
) -> bool:
    """Return whether the user can access the requested employee record."""

    return bool(
        get_allowed_fields(db, user, target_employee_id)
    )
