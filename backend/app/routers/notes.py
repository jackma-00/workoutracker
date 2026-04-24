from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Response

from app.schemas import NoteCreate, NoteResponse, NoteUpdate, PinUpdateRequest
from app.services.note_service import NoteService

router = APIRouter(prefix="/notes", tags=["notes"])


def get_note_service() -> NoteService:
    return NoteService()


@router.get("", response_model=list[NoteResponse])
def list_notes(
    category: Optional[str] = None,
    pinned: Optional[bool] = None,
    note_service: NoteService = Depends(get_note_service),
):
    return note_service.list_notes(category=category, pinned=pinned)


@router.post("", response_model=NoteResponse, status_code=201)
def create_note(payload: NoteCreate, note_service: NoteService = Depends(get_note_service)):
    return note_service.create_note(payload)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, note_service: NoteService = Depends(get_note_service)):
    return note_service.get_note(note_id)


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, payload: NoteUpdate, note_service: NoteService = Depends(get_note_service)):
    return note_service.update_note(note_id, payload)


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, note_service: NoteService = Depends(get_note_service)):
    note_service.delete_note(note_id)
    return Response(status_code=204)


@router.patch("/{note_id}/pin", response_model=NoteResponse)
def update_pin(
    note_id: int,
    payload: PinUpdateRequest,
    note_service: NoteService = Depends(get_note_service),
):
    return note_service.update_pin(note_id=note_id, is_pinned=payload.is_pinned)
