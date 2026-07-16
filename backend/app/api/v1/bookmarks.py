import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.question import Question
from app.models.user import User
from app.schemas.bookmark import BookmarksResponse
from app.services import bookmark_service
from app.services.interview_service import get_session_by_id

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


@router.get("/", response_model=BookmarksResponse)
def get_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions, questions = bookmark_service.get_bookmarks(db, current_user.id)
    return BookmarksResponse(sessions=sessions, questions=questions)


@router.post("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def bookmark_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    bookmark_service.add_bookmark(db, current_user.id, "session", session_id)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def unbookmark_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookmark_service.remove_bookmark(db, current_user.id, "session", session_id)


@router.post("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def bookmark_question(
    question_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify the question belongs to a session owned by this user.
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    session = get_session_by_id(db, question.session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    bookmark_service.add_bookmark(db, current_user.id, "question", question_id)


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def unbookmark_question(
    question_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookmark_service.remove_bookmark(db, current_user.id, "question", question_id)
