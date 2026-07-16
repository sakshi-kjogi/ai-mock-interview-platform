import uuid

from sqlalchemy.orm import Session

from app.core.gemini import generate_interview_questions
from app.models.interview_session import InterviewSession
from app.models.question import Question


def get_user_previous_question_texts(
    db: Session, user_id: uuid.UUID, limit: int = 100
) -> list[str]:
    """Returns this user's most recent previously-asked question texts across
    all their past interview sessions, so we can avoid generating the same
    ones again. Capped at `limit` to keep the exclusion list (and the Gemini
    prompt built from it) from growing unbounded for long-time users."""
    rows = (
        db.query(Question.question_text)
        .join(InterviewSession, Question.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == user_id)
        .order_by(Question.created_at.desc())
        .limit(limit)
        .all()
    )
    return [r[0] for r in rows]


def generate_and_save_questions(
    db: Session,
    session: InterviewSession,
    num_questions: int = 5,
) -> list[Question]:
    # Delete any previously generated questions for this session.
    # Safe at this stage because answers don't exist yet.
    # Day 5 will guard this with an answers-exist check.
    db.query(Question).filter(Question.session_id == session.id).delete()
    db.commit()

    exclude_questions = get_user_previous_question_texts(db, session.user_id)

    raw = generate_interview_questions(
        role_title=session.role_title,
        interview_type=session.interview_type.value,
        num_questions=num_questions,
        exclude_questions=exclude_questions,
    )

    questions = []
    for idx, q in enumerate(raw):
        question = Question(
            session_id=session.id,
            question_text=q["question_text"],
            category=q.get("category"),
            order_index=idx,
        )
        db.add(question)
        questions.append(question)

    db.commit()
    for q in questions:
        db.refresh(q)

    return questions


def get_session_questions(db: Session, session_id: uuid.UUID) -> list[Question]:
    return (
        db.query(Question)
        .filter(Question.session_id == session_id)
        .order_by(Question.order_index)
        .all()
    )
