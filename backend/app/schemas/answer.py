import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AnswerCreate(BaseModel):
    answer_text: str
    time_taken_seconds: Optional[int] = None


class AnswerResponse(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    answer_text: str
    time_taken_seconds: Optional[int] = None
    submitted_at: datetime

    model_config = {"from_attributes": True}