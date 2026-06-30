import uuid

from sqlalchemy.orm import Session

from app.models.session_violation import SessionViolation, ViolationType
from app.schemas.violation import IntegritySummary, ViolationCreate


def log_violation(
    db: Session, session_id: uuid.UUID, data: ViolationCreate
) -> SessionViolation:
    violation = SessionViolation(
        session_id=session_id,
        question_id=data.question_id,
        violation_type=data.violation_type,
    )
    db.add(violation)
    db.commit()
    db.refresh(violation)
    return violation


def get_session_violations(
    db: Session, session_id: uuid.UUID
) -> list[SessionViolation]:
    return (
        db.query(SessionViolation)
        .filter(SessionViolation.session_id == session_id)
        .order_by(SessionViolation.occurred_at)
        .all()
    )


def get_integrity_summary(db: Session, session_id: uuid.UUID) -> IntegritySummary:
    violations = get_session_violations(db, session_id)
    counts = {v_type: 0 for v_type in ViolationType}
    for v in violations:
        counts[v.violation_type] += 1

    total = len(violations)
    return IntegritySummary(
        total_violations=total,
        fullscreen_exits=counts[ViolationType.fullscreen_exit],
        tab_switches=counts[ViolationType.tab_switch],
        window_blurs=counts[ViolationType.window_blur],
        copy_attempts=counts[ViolationType.copy_attempt],
        cut_attempts=counts[ViolationType.cut_attempt],
        paste_attempts=counts[ViolationType.paste_attempt],
        context_menu_attempts=counts[ViolationType.context_menu],
        status="passed" if total == 0 else "violations_detected",
    )