import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.session_violation import ViolationType


class ViolationCreate(BaseModel):
    violation_type: ViolationType
    question_id: Optional[uuid.UUID] = None


class ViolationResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    question_id: Optional[uuid.UUID] = None
    violation_type: ViolationType
    occurred_at: datetime

    model_config = {"from_attributes": True}


class IntegritySummary(BaseModel):
    total_violations: int
    fullscreen_exits: int
    tab_switches: int
    window_blurs: int
    copy_attempts: int
    cut_attempts: int
    paste_attempts: int
    context_menu_attempts: int
    status: str  # "passed" | "violations_detected"