import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.question import Question
from app.models.user import User
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.services.answer_service import get_session_answers, submit_answer
from app.services.interview_service import get_session_by_id

router = APIRouter(tags=["Answers"])


@router.post(
    "/interviews/{session_id}/questions/{question_id}/answer",
    response_model=AnswerResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_question_answer(
    session_id: uuid.UUID,
    question_id: uuid.UUID,
    data: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify session ownership first.
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Verify the question actually belongs to this session.
    question = (
        db.query(Question)
        .filter(Question.id == question_id, Question.session_id == session_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return submit_answer(db, question_id, data)


@router.get(
    "/interviews/{session_id}/answers",
    response_model=list[AnswerResponse],
)
def list_session_answers(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    return get_session_answers(db, session_id)