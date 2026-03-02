from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func , desc
from sqlalchemy.orm import selectinload
from typing import Annotated

from db.database import get_db
from db.models import User, Pitch
from schemas.dashboard import PitchCreate, PitchRead, DashboardSummary
from api.deps import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.post("/pitches", response_model=PitchRead, status_code=201)
async def create_pitch(
    pitch_in: PitchCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new Pitch record initialized with null scores before the websocket/live session begins.
    """
    pitch = Pitch(
        user_id=current_user.id,
        startup_id=pitch_in.startup_id,
        mode=pitch_in.mode,
        investor_archetype=pitch_in.investor_archetype,
    )
    db.add(pitch)
    await db.commit()
    await db.refresh(pitch)
    return pitch


@router.get("/pitches/recent", response_model=list[PitchRead])
async def get_recent_pitches(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    limit: int = 5,
):
    query = (
        select(Pitch)
        .options(selectinload(Pitch.recommendations))
        .where(Pitch.user_id == current_user.id)
        .order_by(desc(Pitch.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    # 1. Total Pitches
    count_query = select(func.count(Pitch.id)).where(Pitch.user_id == current_user.id)
    total_pitches = (await db.execute(count_query)).scalar() or 0

    # 2. Average Overall Score
    avg_query = select(func.avg(Pitch.overall_score)).where(
        Pitch.user_id == current_user.id, Pitch.overall_score.is_not(None)
    )
    avg_score = (await db.execute(avg_query)).scalar()

    # 3. Recent Pitches Top 3
    recent_query = (
        select(Pitch)
        .options(selectinload(Pitch.recommendations))
        .where(Pitch.user_id == current_user.id)
        .order_by(desc(Pitch.created_at))
        .limit(3)
    )
    recent_pitches = (await db.execute(recent_query)).scalars().all()

    return DashboardSummary(
        total_pitches=total_pitches,
        average_score=avg_score,
        recent_pitches=list(recent_pitches),
    )


@router.get("/pitches/{pitch_id}", response_model=PitchRead)
async def get_pitch_details(
    pitch_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Pitch)
        .options(selectinload(Pitch.recommendations))
        .where(Pitch.id == pitch_id, Pitch.user_id == current_user.id)
    )
    result = await db.execute(query)
    pitch = result.scalar_one_or_none()

    if not pitch:
        raise HTTPException(status_code=404, detail="Pitch not found")

    return pitch
