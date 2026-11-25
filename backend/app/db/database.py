
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings


# Connect to PostgreSQL
engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)


# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for database models
Base = declarative_base()


# Dependency for FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def create_tables():
    from app.db import models

    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
