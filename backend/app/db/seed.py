
import random
import sys
from datetime import date
from pathlib import Path

import bcrypt

# Add backend to Python's import path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.db.database import SessionLocal
from app.db.models import Employee, User


DEMO_PASSWORD = "Password@123"

# (friend_dataset_id, name, title, department, manager_dataset_id, role)
PEOPLE = [
    (1, "Rajesh Mehta", "CEO", "Executive", None, "admin"),
    (2, "Priya Nair", "VP Engineering", "Engineering", 1, "manager"),
    (3, "Amit Verma", "VP Sales", "Sales", 1, "manager"),
    (4, "Sneha Kulkarni", "Head of HR", "HR", 1, "hr"),
    (5, "Rohan Desai", "Backend Manager", "Engineering", 2, "manager"),
    (6, "Kavita Joshi", "Frontend Manager", "Engineering", 2, "manager"),
    (7, "Vikram Singh", "Sales Manager North", "Sales", 3, "manager"),
    (8, "Neha Patil", "Sales Manager West", "Sales", 3, "manager"),
    (9, "Arjun Rao", "HR Manager Talent", "HR", 4, "manager"),
    (10, "Meera Iyer", "HR Manager Operations", "HR", 4, "manager"),
    (11, "Karan Shah", "Backend Developer", "Engineering", 5, "employee"),
    (12, "Divya Menon", "Backend Developer", "Engineering", 5, "employee"),
    (13, "Aditya Kulkarni", "DevOps Engineer", "Engineering", 5, "employee"),
    (14, "Pooja Reddy", "Backend Developer", "Engineering", 5, "employee"),
    (15, "Siddharth Jain", "Frontend Developer", "Engineering", 6, "employee"),
    (16, "Ananya Gupta", "UI Engineer", "Engineering", 6, "employee"),
    (17, "Rahul Pawar", "Frontend Developer", "Engineering", 6, "employee"),
    (18, "Isha Kapoor", "Sales Executive", "Sales", 7, "employee"),
    (19, "Manish Yadav", "Sales Executive", "Sales", 7, "employee"),
    (20, "Tanvi Bhatt", "Account Manager", "Sales", 7, "employee"),
    (21, "Nikhil Chavan", "Sales Executive", "Sales", 8, "employee"),
    (22, "Ritu Sharma", "Account Manager", "Sales", 8, "employee"),
    (23, "Harsh Vora", "Sales Executive", "Sales", 8, "employee"),
    (24, "Simran Kaur", "Recruiter", "HR", 9, "employee"),
    (25, "Yash Thakur", "Recruiter", "HR", 9, "employee"),
    (26, "Lata Deshmukh", "Talent Partner", "HR", 9, "employee"),
    (27, "Gaurav Mishra", "HR Executive", "HR", 10, "employee"),
    (28, "Payal Sethi", "Payroll Analyst", "HR", 10, "employee"),
    (29, "Omkar Bhosale", "HR Executive", "HR", 10, "employee"),
    (30, "Zoya Khan", "Policy Analyst", "HR", 10, "employee"),
]

SALARY_BAND = {
    "admin": (6000000, 8000000),
    "hr": (2500000, 3500000),
    "manager": (1800000, 3000000),
    "employee": (600000, 1400000),
}


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def make_username(name: str) -> str:
    return name.lower().replace(" ", ".")


def make_email(name: str) -> str:
    return f"{make_username(name)}@acme.com"


def generate_hire_date(rng: random.Random) -> date:
    year = rng.randint(2015, 2025)
    month = rng.randint(1, 12)
    day = rng.randint(1, 28)
    return date(year, month, day)


def seed_database():
    rng = random.Random(42)
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # 1. Complete missing fields for existing employees
        # -------------------------------------------------
        existing_employees = db.query(Employee).all()

        for employee in existing_employees:
            if not employee.email:
                employee.email = make_email(employee.name)

            if not employee.hire_date:
                employee.hire_date = generate_hire_date(rng)

            if employee.leave_taken is None:
                employee.leave_taken = 0

            if employee.sick_leave_balance is None:
                employee.sick_leave_balance = 12

            if employee.sick_leave_taken is None:
                employee.sick_leave_taken = 0

        db.flush()

        # -------------------------------------------------
        # 2. Prepare password hash for new user accounts
        # -------------------------------------------------
        password_hash = hash_password(DEMO_PASSWORD)

        # Maps friend's dataset IDs to actual PostgreSQL IDs
        employee_id_map = {}

        # -------------------------------------------------
        # 3. Insert the 30 new employees and their users
        # -------------------------------------------------
        for dataset_id, name, title, dept, manager_dataset_id, role in PEOPLE:

            email = make_email(name)
            username = make_username(name)

            # Skip an employee if already inserted
            employee = db.query(Employee).filter(
                Employee.email == email
            ).first()

            if employee is None:
                manager_id = (
                    employee_id_map.get(manager_dataset_id)
                    if manager_dataset_id is not None
                    else None
                )

                low, high = SALARY_BAND[role]

                employee = Employee(
                    name=name,
                    email=email,
                    title=title,
                    department=dept,
                    manager_id=manager_id,
                    hire_date=generate_hire_date(rng),
                    salary=round(rng.randint(low, high), -3),
                    leave_balance=24 - rng.randint(0, 18),
                    leave_taken=0,
                    sick_leave_balance=12,
                    sick_leave_taken=rng.randint(0, 6),
                    performance_rating="Good"
                )

                db.add(employee)
                db.flush()

            # Store actual PostgreSQL ID for hierarchy mapping
            employee_id_map[dataset_id] = employee.id

            # Create login account if it does not already exist
            user = db.query(User).filter(
                User.username == username
            ).first()

            if user is None:
                db.add(
                    User(
                        employee_id=employee.id,
                        username=username,
                        hashed_password=password_hash,
                        role=role
                    )
                )

        db.commit()

        employee_count = db.query(Employee).count()
        user_count = db.query(User).count()

        print("Database seeding completed successfully!")
        print(f"Total employees: {employee_count}")
        print(f"Total users: {user_count}")
        print(f"New demo account password: {DEMO_PASSWORD}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
