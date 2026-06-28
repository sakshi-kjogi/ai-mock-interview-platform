import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.answer import Answer
from app.models.feedback import Feedback
from app.models.interview_session import InterviewSession, SessionStatus
from app.models.question import Question
from app.schemas.analytics import (
    CategoryStat,
    DashboardAnalytics,
    SessionScoreTrend,
)


def get_dashboard_analytics(db: Session, user_id: uuid.UUID) -> DashboardAnalytics:
    # ── Total and completed session counts ──────────────────────────────────
    total = db.query(func.count(InterviewSession.id)).filter(
        InterviewSession.user_id == user_id
    ).scalar() or 0

    completed = db.query(func.count(InterviewSession.id)).filter(
        InterviewSession.user_id == user_id,
        InterviewSession.status == SessionStatus.completed,
    ).scalar() or 0

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    # ── Overall average score ────────────────────────────────────────────────
    overall_avg = (
        db.query(func.avg(Feedback.score))
        .join(Answer, Feedback.answer_id == Answer.id)
        .join(Question, Answer.question_id == Question.id)
        .join(InterviewSession, Question.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == user_id)
        .scalar()
    )

    # ── Average time per answer (seconds) ────────────────────────────────────
    avg_time = (
        db.query(func.avg(Answer.time_taken_seconds))
        .join(Question, Answer.question_id == Question.id)
        .join(InterviewSession, Question.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == user_id)
        .scalar()
    )

    # ── Score trend — last 10 completed sessions, oldest first ───────────────
    trend_rows = (
        db.query(
            InterviewSession.id,
            InterviewSession.role_title,
            InterviewSession.created_at,
            func.avg(Feedback.score).label("avg_score"),
        )
        .join(Question, Question.session_id == InterviewSession.id)
        .join(Answer, Answer.question_id == Question.id)
        .join(Feedback, Feedback.answer_id == Answer.id)
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.status == SessionStatus.completed,
        )
        .group_by(InterviewSession.id)
        .order_by(InterviewSession.created_at.asc())
        .limit(10)
        .all()
    )

    score_trend = [
        SessionScoreTrend(
            session_id=str(row.id),
            role_title=row.role_title,
            created_at=row.created_at,
            avg_score=round(float(row.avg_score), 1),
        )
        for row in trend_rows
    ]

    # ── Category breakdown ───────────────────────────────────────────────────
    category_rows = (
        db.query(
            Question.category,
            func.avg(Feedback.score).label("avg_score"),
            func.count(Feedback.id).label("count"),
        )
        .join(Answer, Answer.question_id == Question.id)
        .join(Feedback, Feedback.answer_id == Answer.id)
        .join(InterviewSession, Question.session_id == InterviewSession.id)
        .filter(
            InterviewSession.user_id == user_id,
            Question.category.isnot(None),
        )
        .group_by(Question.category)
        .order_by(func.avg(Feedback.score).desc())
        .all()
    )

    category_breakdown = [
        CategoryStat(
            category=row.category,
            avg_score=round(float(row.avg_score), 1),
            count=row.count,
        )
        for row in category_rows
    ]

    return DashboardAnalytics(
        total_sessions=total,
        completed_sessions=completed,
        completion_rate=completion_rate,
        overall_avg_score=round(float(overall_avg), 1) if overall_avg else None,
        avg_time_per_answer_seconds=round(float(avg_time), 1) if avg_time else None,
        score_trend=score_trend,
        category_breakdown=category_breakdown,
    )