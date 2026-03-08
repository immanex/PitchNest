from __future__ import annotations
from datetime import datetime, timezone
import uuid
from sqlalchemy import DateTime

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Integer,
    Float,
    Table,
    Column,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def generate_uuid():
    return str(uuid.uuid4())


## --- ASSOCIATION TABLES ---
room_members = Table(
    "room_members",
    Base.metadata,
    Column("room_id", ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


# --- AUTHENTICATION ---
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    chats: Mapped[list["ChatMessage"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    # Relationships
    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    startups: Mapped[list["StartupProfile"]] = relationship(
        back_populates="founder", cascade="all, delete-orphan"
    )
    pitches: Mapped[list["Pitch"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    rooms: Mapped[list["Room"]] = relationship(
        "Room", secondary=room_members, back_populates="members"
    )
    owned_rooms: Mapped[list["Room"]] = relationship(
        "Room", back_populates="owner", foreign_keys="Room.owner_id"
    )


# --- ONBOARDING ---
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    role: Mapped[str] = mapped_column(String, nullable=False)
    ai_preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship(back_populates="profile")


class StartupProfile(Base):
    __tablename__ = "startup_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    founder_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE")
    )
    company_name: Mapped[str] = mapped_column(String, nullable=False)
    industry: Mapped[str | None] = mapped_column(String, nullable=True)
    stage: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    founder: Mapped["User"] = relationship(back_populates="startups")
    pitches: Mapped[list["Pitch"]] = relationship(
        back_populates="startup", cascade="all, delete-orphan"
    )


# --- CORE DASHBOARD & PITCHING --- #


class Pitch(Base):
    __tablename__ = "pitches"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE")
    )

    startup_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("startup_profiles.id", ondelete="SET NULL"), nullable=True
    )

    # 👇 NEW FIELDS FROM FRONTEND
    industry: Mapped[str | None] = mapped_column(String, nullable=True)
    startup_type: Mapped[str | None] = mapped_column(String, nullable=True)
    experience_level: Mapped[str | None] = mapped_column(String, nullable=True)

    mode: Mapped[str] = mapped_column(String, nullable=False, default="Practice")
    investor_archetype: Mapped[str | None] = mapped_column(String, nullable=True)

    room_id: Mapped[str | None] = mapped_column(String, nullable=True)

    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    communication_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    clarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    market_fit_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    verdict: Mapped[str | None] = mapped_column(String, nullable=True)
    feedback_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="pitches")
    startup: Mapped["StartupProfile"] = relationship(back_populates="pitches")

    recommendations: Mapped[list["AIRecommendation"]] = relationship(
        back_populates="pitch", cascade="all, delete-orphan"
    )


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    pitch_id: Mapped[str] = mapped_column(
        String, ForeignKey("pitches.id", ondelete="CASCADE")
    )
    category: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    pitch: Mapped["Pitch"] = relationship(back_populates="recommendations")


## WEBSOCKET ROOM MODEL


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(
        String, primary_key=True
    )  # room_id generated in socket.py
    owner_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE")
    )
    closed = Column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    members: Mapped[list["User"]] = relationship(
        "User", secondary=room_members, back_populates="rooms"
    )
    chats: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="room", cascade="all, delete-orphan"
    )

    owner: Mapped["User"] = relationship(
        "User", back_populates="owned_rooms", foreign_keys=[owner_id]
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    room_id: Mapped[str] = mapped_column(
        String, ForeignKey("rooms.id", ondelete="CASCADE")
    )
    user_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="chats")
    room: Mapped["Room"] = relationship(back_populates="chats")
