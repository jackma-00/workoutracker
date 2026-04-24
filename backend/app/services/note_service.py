from __future__ import annotations

from typing import Optional

from fastapi import HTTPException

from app.repositories.note_repository import NoteRepository
from app.schemas import NoteCreate, NoteUpdate


class NoteService:
    def __init__(self, note_repository: Optional[NoteRepository] = None) -> None:
        self.note_repository = note_repository or NoteRepository()

    def list_notes(self, category: Optional[str] = None, pinned: Optional[bool] = None):
        return self.note_repository.list_notes(category=category, pinned=pinned)

    def get_note(self, note_id: int):
        note = self.note_repository.get_note(note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note

    def create_note(self, payload: NoteCreate):
        return self.note_repository.create_note(
            title=payload.title,
            content=payload.content,
            category=payload.category,
            is_pinned=payload.is_pinned,
            background_color=payload.background_color,
        )

    def update_note(self, note_id: int, payload: NoteUpdate):
        note = self.note_repository.update_note(
            note_id=note_id,
            title=payload.title,
            content=payload.content,
            category=payload.category,
            is_pinned=payload.is_pinned,
            background_color=payload.background_color,
        )
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note

    def delete_note(self, note_id: int):
        deleted = self.note_repository.delete_note(note_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Note not found")

    def update_pin(self, note_id: int, is_pinned: bool):
        note = self.note_repository.update_pin(note_id=note_id, is_pinned=is_pinned)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
