import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.interview_session import SessionStatus
from app.models.user import User
from app.schemas.feedback import FeedbackResponse
from app.services.feedback_service import generate_session_feedback, get_session_feedback
from app.services.interview_service import get_session_by_id

router = APIRouter(tags=["Feedback"])

# Sessions that are eligible for AI evaluation.
_EVALUABLE_STATUSES = {SessionStatus.completed, SessionStatus.terminated}


@router.post(
    "/interviews/{session_id}/evaluate",
    response_model=list[FeedbackResponse],
    status_code=status.HTTP_201_CREATED,
)
def evaluate_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.status not in _EVALUABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session must be completed or terminated before evaluation",
        )

    try:
        return generate_session_feedback(db, session)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {e}",
        )


@router.get(
    "/interviews/{session_id}/feedback",
    response_model=list[FeedbackResponse],
)
def list_feedback(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    return get_session_feedback(db, session_id)