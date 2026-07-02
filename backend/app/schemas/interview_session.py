import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator

from app.models.interview_session import InterviewType, SessionStatus


class InterviewSessionCreate(BaseModel):
    role_title: str
    interview_type: InterviewType

    @field_validator("role_title")
    @classmethod
    def role_title_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Role title cannot be empty")
        if len(v) > 200:
            raise ValueError("Role title must be 200 characters or fewer")
        return v


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