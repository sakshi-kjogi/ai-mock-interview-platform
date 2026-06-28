import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.answer import Answer
from app.models.question import Question
from app.schemas.answer import AnswerCreate


def submit_answer(
    db: Session,
    question_id: uuid.UUID,
    data: AnswerCreate,
) -> Answer:
    # Upsert — update if an answer already exists, insert if not.
    # The unique constraint on question_id means a plain INSERT would
    # fail on re-submission, so we always check first.
    existing = db.query(Answer).filter(Answer.question_id == question_id).first()

    if existing:
        existing.answer_text = data.answer_text
        existing.time_taken_seconds = data.time_taken_seconds
        existing.submitted_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    answer = Answer(
        question_id=question_id,
        answer_text=data.answer_text,
        time_taken_seconds=data.time_taken_seconds,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_session_answers(db: Session, session_id: uuid.UUID) -> list[Answer]:
    # Join through questions to filter by session.
    return (
        db.query(Answer)
        .join(Question, Answer.question_id == Question.id)
        .filter(Question.session_id == session_id)
        .order_by(Question.order_index)
        .all()
    )