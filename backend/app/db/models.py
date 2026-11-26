
from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Date
)

from app.db.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    title = Column(String)
    department = Column(String)

    manager_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    hire_date = Column(Date)

    salary = Column(Float)
    leave_balance = Column(Integer)

    # Leave information
    leave_taken = Column(Integer, default=0)
    sick_leave_balance = Column(Integer, default=12)
    sick_leave_taken = Column(Integer, default=0)

    performance_rating = Column(String)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # employee | manager | hr | admin
    role = Column(String, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer)
    username = Column(String)
    action = Column(String)
    query = Column(String)

    # ALLOWED | BLOCKED
    decision = Column(String)
    reason = Column(String)
