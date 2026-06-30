import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.resume_feedback import ActionType, Priority


class ResumeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    file_url: str
    parsed_text: Optional[str] = None
    parsed_skills: Optional[dict] = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class ResumeFeedbackResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    category: str
    action_type: ActionType
    suggestion_text: str
    priority: Priority
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeInterviewRequest(BaseModel):
    role_title: str
    interview_type: str