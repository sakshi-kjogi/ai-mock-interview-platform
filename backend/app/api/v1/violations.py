import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.violation import IntegritySummary, ViolationCreate, ViolationResponse
from app.services import violation_service
from app.services.interview_service import get_session_by_id

router = APIRouter(tags=["Integrity"])


@router.post(
    "/interviews/{session_id}/violations",
    response_model=ViolationResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_violation(
    session_id: uuid.UUID,
    data: ViolationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return violation_service.log_violation(db, session_id, data)


@router.get(
    "/interviews/{session_id}/violations",
    response_model=list[ViolationResponse],
)
def list_violations(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return violation_service.get_session_violations(db, session_id)


@router.get(
    "/interviews/{session_id}/integrity-summary",
    response_model=IntegritySummary,
)
def integrity_summary(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return violation_service.get_integrity_summary(db, session_id)