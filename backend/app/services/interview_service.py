import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.interview_session import InterviewSession, SessionStatus
from app.schemas.interview_session import InterviewSessionCreate, InterviewSessionUpdate


def create_session(
    db: Session, user_id: uuid.UUID, data: InterviewSessionCreate
) -> InterviewSession:
    session = InterviewSession(
        user_id=user_id,
        role_title=data.role_title,
        interview_type=data.interview_type,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_user_sessions(db: Session, user_id: uuid.UUID) -> list[InterviewSession]:
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )


def get_session_by_id(
    db: Session, session_id: uuid.UUID, user_id: uuid.UUID
) -> InterviewSession | None:
    # Always filter by user_id alongside session_id.
    # This prevents user A from accessing user B's session
    # by guessing a valid UUID.
    return (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )


def update_session_status(
    db: Session,
    session: InterviewSession,
    data: InterviewSessionUpdate,
) -> InterviewSession:
    session.status = data.status
    if data.status == SessionStatus.completed:
        session.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session