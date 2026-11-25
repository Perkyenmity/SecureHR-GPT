
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text
)

from app.db.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String)
    title = Column(String)
    salary = Column(Float)
    leave_balance = Column(Integer)
    performance_rating = Column(String)

    manager_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # employee | manager | hr | admin
    role = Column(String, nullable=False)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer)
    username = Column(String)
    action = Column(String)
    query = Column(Text)

    # ALLOWED | BLOCKED
    decision = Column(String)
    reason = Column(String)
