import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.interview_session import InterviewType, SessionStatus


class InterviewSessionCreate(BaseModel):
    role_title: str
    interview_type: InterviewType


class InterviewSessionUpdate(BaseModel):
    status: SessionStatus


class InterviewSessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role_title: str
    interview_type: InterviewType
    status: SessionStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}