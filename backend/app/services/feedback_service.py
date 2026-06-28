import uuid

from sqlalchemy.orm import Session

from app.core.gemini import evaluate_answer
from app.models.answer import Answer
from app.models.feedback import Feedback
from app.models.interview_session import InterviewSession
from app.models.question import Question


def generate_session_feedback(
    db: Session, session: InterviewSession
) -> list[Feedback]:
    questions = (
        db.query(Question)
        .filter(Question.session_id == session.id)
        .order_by(Question.order_index)
        .all()
    )

    feedbacks = []
    for question in questions:
        answer = (
            db.query(Answer).filter(Answer.question_id == question.id).first()
        )
        if not answer:
            continue

        # Skip if feedback already exists — idempotent evaluation.
        existing = (
            db.query(Feedback).filter(Feedback.answer_id == answer.id).first()
        )
        if existing:
            feedbacks.append(existing)
            continue

        result = evaluate_answer(question.question_text, answer.answer_text)

        feedback = Feedback(
            answer_id=answer.id,
            score=result["score"],
            strengths=result["strengths"],
            improvements=result["improvements"],
            raw_ai_response=result.get("raw"),
        )
        db.add(feedback)
        feedbacks.append(feedback)

    db.commit()
    for f in feedbacks:
        db.refresh(f)

    return feedbacks


def get_session_feedback(db: Session, session_id: uuid.UUID) -> list[Feedback]:
    return (
        db.query(Feedback)
        .join(Answer, Feedback.answer_id == Answer.id)
        .join(Question, Answer.question_id == Question.id)
        .filter(Question.session_id == session_id)
        .order_by(Question.order_index)
        .all()
    )