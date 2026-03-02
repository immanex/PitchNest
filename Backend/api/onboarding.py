from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated

from db.database import get_db
from db.models import User, UserProfile, StartupProfile
from schemas.onboarding import UserProfileCreate, UserProfileRead, StartupProfileCreate, StartupProfileRead
from api.deps import get_current_active_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

@router.post("/role", response_model=UserProfileRead, status_code=status.HTTP_201_CREATED)
async def create_user_profile(
    profile_in: UserProfileCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    query = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(query)
    
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already exists for this user")
        
    profile = UserProfile(
        user_id=current_user.id,
        role=profile_in.role,
        ai_preferences=profile_in.ai_preferences
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/profile", response_model=UserProfileRead)
async def get_own_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    query = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/ai-preferences", response_model=UserProfileRead)
async def update_ai_preferences(
    preferences: dict,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    query = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found, set role first")
        
    profile.ai_preferences = preferences
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/startup", response_model=StartupProfileRead, status_code=status.HTTP_201_CREATED)
async def create_startup_profile(
    startup_in: StartupProfileCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    startup = StartupProfile(
        founder_id=current_user.id,
        company_name=startup_in.company_name,
        industry=startup_in.industry,
        stage=startup_in.stage,
        description=startup_in.description
    )
    db.add(startup)
    await db.commit()
    await db.refresh(startup)
    return startup

@router.get("/startup", response_model=list[StartupProfileRead])
async def get_own_startups(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    query = select(StartupProfile).where(StartupProfile.founder_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()
