from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated
from datetime import timedelta
import logging

from db.database import get_db
from db.models import User
from schemas.auth import UserCreate, UserRead, Token, PasswordResetRequest, PasswordResetConfirm
from core.security import get_password_hash, verify_password, create_access_token
from core.config import settings
from api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A user with this user name already exists in the system.",
        )
    
    # Create new user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login_access_token(
    db: Annotated[AsyncSession, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        status="success",
        message="Login successful"
    )

@router.post("/password-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    pwd_reset: PasswordResetRequest, 
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where(User.email == pwd_reset.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user:
        reset_token = create_access_token(
            subject=user.id, expires_delta=timedelta(minutes=15)
        )
        logger.warning(f"MOCK EMAIL: User {user.email} requested reset. Link: /auth/password-reset/confirm?token={reset_token}")
        
    return {"message": "If the email is valid, a reset link has been provided."}

@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
async def confirm_password_reset(
    confirm: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    try:
        import jwt
        payload = jwt.decode(confirm.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid or expired reset token")
         
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(confirm.new_password)
    db.add(user)
    await db.commit()
    return {"message": "Password updated successfully."}

@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
