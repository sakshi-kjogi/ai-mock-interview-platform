import uuid

from sqlalchemy.orm import Session

from app.models.bookmark import Bookmark
from app.models.interview_session import InterviewSession
from app.models.question import Question
from app.schemas.bookmark import BookmarkedQuestion, BookmarkedSession


def add_bookmark(db: Session, user_id: uuid.UUID, item_type: str, item_id: uuid.UUID) -> Bookmark:
    existing = (
        db.query(Bookmark)
        .filter(Bookmark.user_id == user_id, Bookmark.item_type == item_type, Bookmark.item_id == item_id)
        .first()
    )
    if existing:
        return existing  # already bookmarked — idempotent

    bookmark = Bookmark(user_id=user_id, item_type=item_type, item_id=item_id)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


def remove_bookmark(db: Session, user_id: uuid.UUID, item_type: str, item_id: uuid.UUID) -> None:
    db.query(Bookmark).filter(
        Bookmark.user_id == user_id, Bookmark.item_type == item_type, Bookmark.item_id == item_id
    ).delete()
    db.commit()


def list_bookmarked_session_ids(db: Session, user_id: uuid.UUID) -> set[uuid.UUID]:
    """Used by the frontend to show a filled/outline bookmark icon on
    interview cards without a separate lookup per item."""
    rows = (
        db.query(Bookmark.item_id)
        .filter(Bookmark.user_id == user_id, Bookmark.item_type == "session")
        .all()
    )
    return {r[0] for r in rows}


def list_bookmarked_question_ids(db: Session, user_id: uuid.UUID) -> set[uuid.UUID]:
    rows = (
        db.query(Bookmark.item_id)
        .filter(Bookmark.user_id == user_id, Bookmark.item_type == "question")
        .all()
    )
    return {r[0] for r in rows}


def get_bookmarks(db: Session, user_id: uuid.UUID) -> tuple[list[BookmarkedSession], list[BookmarkedQuestion]]:
    session_bookmarks = (
        db.query(Bookmark, InterviewSession)
        .join(InterviewSession, Bookmark.item_id == InterviewSession.id)
        .filter(
            Bookmark.user_id == user_id,
            Bookmark.item_type == "session",
            InterviewSession.user_id == user_id,  # defense in depth
        )
        .order_by(Bookmark.created_at.desc())
        .all()
    )
    sessions = [
        BookmarkedSession(
            id=sess.id,
            role_title=sess.role_title,
            interview_type=sess.interview_type.value,
            status=sess.status.value,
            created_at=sess.created_at,
            bookmarked_at=bm.created_at,
        )
        for bm, sess in session_bookmarks
    ]

    question_bookmarks = (
        db.query(Bookmark, Question, InterviewSession)
        .join(Question, Bookmark.item_id == Question.id)
        .join(InterviewSession, Question.session_id == InterviewSession.id)
        .filter(
            Bookmark.user_id == user_id,
            Bookmark.item_type == "question",
            InterviewSession.user_id == user_id,  # defense in depth
        )
        .order_by(Bookmark.created_at.desc())
        .all()
    )
    questions = [
        BookmarkedQuestion(
            id=q.id,
            question_text=q.question_text,
            category=q.category,
            session_id=sess.id,
            role_title=sess.role_title,
            bookmarked_at=bm.created_at,
        )
        for bm, q, sess in question_bookmarks
    ]

    return sessions, questions
