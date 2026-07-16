import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BookmarkedSession(BaseModel):
    id: uuid.UUID
    role_title: str
    interview_type: str
    status: str
    created_at: datetime
    bookmarked_at: datetime

    model_config = {"from_attributes": True}


class BookmarkedQuestion(BaseModel):
    id: uuid.UUID
    question_text: str
    category: Optional[str] = None
    session_id: uuid.UUID
    role_title: str
    bookmarked_at: datetime

    model_config = {"from_attributes": True}


class BookmarksResponse(BaseModel):
    sessions: list[BookmarkedSession]
    questions: list[BookmarkedQuestion]
