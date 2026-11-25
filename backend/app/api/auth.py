
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import (
    verify_password,
    create_token,
    get_current_user
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Find the user by username
    user = db.query(User).filter(
        User.username == form.username
    ).first()

    # Verify username and password
    if not user or not verify_password(
        form.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Generate JWT access token
    access_token = create_token(user)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "username": current_user.username,
        "role": current_user.role,
        "employee_id": current_user.employee_id
    }
