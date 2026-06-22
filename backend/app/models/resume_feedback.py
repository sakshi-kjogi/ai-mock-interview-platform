import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ActionType(str, enum.Enum):
    add = "add"
    remove = "remove"
    rephrase = "rephrase"


class Priority(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class ResumeFeedback(Base):
    __tablename__ = "resume_feedback"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[ActionType] = mapped_column(SQLEnum(ActionType), nullable=False)
    suggestion_text: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[Priority] = mapped_column(SQLEnum(Priority), default=Priority.medium)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="suggestions")