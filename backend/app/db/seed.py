
import sys
from pathlib import Path

import bcrypt

# Add the backend directory to Python's import path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.db.database import SessionLocal
from app.db.models import Employee, User


def hash_password(password: str) -> str:
    """Convert a plain password into a secure bcrypt hash."""
    password_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def seed_database():
    db = SessionLocal()

    try:
        # Prevent duplicate insertion
        if db.query(User).first():
            print("Demo users already exist. Skipping seed operation.")
            return

        # Sample employee records
        employees = [
            Employee(
                name="Carol Reyes",
                department="HR",
                title="HR Head",
                salary=150000,
                leave_balance=20,
                performance_rating="Excellent",
                manager_id=None
            ),
            Employee(
                name="Bob Mehta",
                department="Engineering",
                title="Engineering Manager",
                salary=130000,
                leave_balance=18,
                performance_rating="Good",
                manager_id=1
            ),
            Employee(
                name="Erin Shah",
                department="Sales",
                title="Sales Manager",
                salary=120000,
                leave_balance=15,
                performance_rating="Good",
                manager_id=1
            ),
            Employee(
                name="Alice Kumar",
                department="Engineering",
                title="Software Engineer",
                salary=90000,
                leave_balance=12,
                performance_rating="Excellent",
                manager_id=2
            ),
            Employee(
                name="Frank Das",
                department="Engineering",
                title="Software Engineer",
                salary=85000,
                leave_balance=10,
                performance_rating="Average",
                manager_id=2
            ),
            Employee(
                name="Grace Lee",
                department="Sales",
                title="Sales Executive",
                salary=70000,
                leave_balance=14,
                performance_rating="Good",
                manager_id=3
            ),
            Employee(
                name="Henry Roy",
                department="Sales",
                title="Sales Executive",
                salary=68000,
                leave_balance=9,
                performance_rating="Average",
                manager_id=3
            ),
            Employee(
                name="Dave Nair",
                department="IT",
                title="System Admin",
                salary=95000,
                leave_balance=16,
                performance_rating="Good",
                manager_id=1
            )
        ]

        db.add_all(employees)
        db.flush()

        # Sample login accounts
        users = [
            ("carol_hr", "hr", 1),
            ("bob_mgr", "manager", 2),
            ("erin_mgr", "manager", 3),
            ("alice_emp", "employee", 4),
            ("frank_emp", "employee", 5),
            ("grace_emp", "employee", 6),
            ("henry_emp", "employee", 7),
            ("dave_admin", "admin", 8)
        ]

        for username, role, employee_id in users:
            db.add(
                User(
                    username=username,
                    hashed_password=hash_password("Passw0rd!"),
                    role=role,
                    employee_id=employee_id
                )
            )

        db.commit()

        print("Sample employee records created successfully!")
        print("Sample user accounts created successfully!")
        print("All demo accounts use the same password: Passw0rd!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
