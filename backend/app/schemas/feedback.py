import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FeedbackResponse(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    score: int
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}