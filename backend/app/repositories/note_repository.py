from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.database import get_connection
from app.models import Note, NoteCategory


class NoteRepository:
    @staticmethod
    def _row_to_note(row) -> Note:
        return Note(
            id=row["id"],
            title=row["title"],
            content=row["content"],
            category=NoteCategory(row["category"]),
            is_pinned=bool(row["is_pinned"]),
            background_color=row["background_color"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
            has_been_edited=bool(row["has_been_edited"]),
        )

    def list_notes(self, category: Optional[str] = None, pinned: Optional[bool] = None) -> list[Note]:
        query = "SELECT * FROM notes"
        conditions: list[str] = []
        values: list[object] = []

        if category:
            conditions.append("LOWER(category) = ?")
            values.append(category.lower())

        if pinned is not None:
            conditions.append("is_pinned = ?")
            values.append(1 if pinned else 0)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY CASE WHEN has_been_edited = 1 THEN updated_at ELSE created_at END DESC"

        with get_connection() as connection:
            rows = connection.execute(query, values).fetchall()

        return [self._row_to_note(row) for row in rows]

    def get_note(self, note_id: int) -> Optional[Note]:
        with get_connection() as connection:
            row = connection.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
        if row is None:
            return None
        return self._row_to_note(row)

    def create_note(
        self,
        title: str,
        content: str,
        category: NoteCategory,
        is_pinned: bool,
        background_color: str,
    ) -> Note:
        now = datetime.now(timezone.utc).isoformat()
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO notes (title, content, category, is_pinned, background_color, created_at, updated_at, has_been_edited)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                """,
                (title, content, category.value, 1 if is_pinned else 0, background_color, now, now),
            )
            note_id = cursor.lastrowid

        return self.get_note(note_id)

    def update_note(
        self,
        note_id: int,
        title: str,
        content: str,
        category: NoteCategory,
        is_pinned: bool,
        background_color: str,
    ) -> Optional[Note]:
        now = datetime.now(timezone.utc).isoformat()
        with get_connection() as connection:
            cursor = connection.execute(
                """
                UPDATE notes
                SET title = ?, content = ?, category = ?, is_pinned = ?, background_color = ?, updated_at = ?, has_been_edited = 1
                WHERE id = ?
                """,
                (title, content, category.value, 1 if is_pinned else 0, background_color, now, note_id),
            )
            if cursor.rowcount == 0:
                return None

        return self.get_note(note_id)

    def delete_note(self, note_id: int) -> bool:
        with get_connection() as connection:
            cursor = connection.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        return cursor.rowcount > 0

    def update_pin(self, note_id: int, is_pinned: bool) -> Optional[Note]:
        now = datetime.now(timezone.utc).isoformat()
        with get_connection() as connection:
            cursor = connection.execute(
                "UPDATE notes SET is_pinned = ?, updated_at = ?, has_been_edited = 1 WHERE id = ?",
                (1 if is_pinned else 0, now, note_id),
            )
            if cursor.rowcount == 0:
                return None

        return self.get_note(note_id)
