from datetime import datetime

from pydantic import BaseModel, Field

from app.models import NoteCategory


class NoteBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    content: str = Field(default="")
    category: NoteCategory
    background_color: str = Field(default="#FFFFFF", pattern=r"^#[0-9A-Fa-f]{6}$")


class NoteCreate(NoteBase):
    is_pinned: bool = False


class NoteUpdate(NoteBase):
    is_pinned: bool


class PinUpdateRequest(BaseModel):
    is_pinned: bool


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    category: NoteCategory
    is_pinned: bool
    background_color: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
