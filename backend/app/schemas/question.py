import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class QuestionResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    question_text: str
    category: Optional[str] = None
    order_index: int
    created_at: datetime

    model_config = {"from_attributes": True}