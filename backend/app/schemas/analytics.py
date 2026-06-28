from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CategoryStat(BaseModel):
    category: str
    avg_score: float
    count: int


class SessionScoreTrend(BaseModel):
    session_id: str
    role_title: str
    created_at: datetime
    avg_score: float


class DashboardAnalytics(BaseModel):
    total_sessions: int
    completed_sessions: int
    completion_rate: float
    overall_avg_score: Optional[float] = None
    avg_time_per_answer_seconds: Optional[float] = None
    score_trend: list[SessionScoreTrend]
    category_breakdown: list[CategoryStat]