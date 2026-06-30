import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ViolationType(str, enum.Enum):
    fullscreen_exit = "fullscreen_exit"
    tab_switch = "tab_switch"
    window_blur = "window_blur"
    copy_attempt = "copy_attempt"
    cut_attempt = "cut_attempt"
    paste_attempt = "paste_attempt"
    context_menu = "context_menu"


class SessionViolation(Base):
    __tablename__ = "session_violations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("interview_sessions.id"), nullable=False)
    question_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=True)
    violation_type: Mapped[ViolationType] = mapped_column(SQLEnum(ViolationType), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="violations")