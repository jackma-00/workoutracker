from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class NoteCategory(str, Enum):
    WORKOUT = "WORKOUT"
    DIET = "DIET"


@dataclass
class Note:
    id: int
    title: str
    content: str
    category: NoteCategory
    is_pinned: bool
    background_color: str
    created_at: datetime
    updated_at: datetime
    has_been_edited: bool
