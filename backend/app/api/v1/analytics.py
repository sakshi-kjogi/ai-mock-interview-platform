from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import DashboardAnalytics
from app.services.analytics_service import get_dashboard_analytics

router = APIRouter(tags=["Analytics"])


@router.get("/analytics/dashboard", response_model=DashboardAnalytics)
def dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_analytics(db, current_user.id)