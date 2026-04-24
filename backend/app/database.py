import sqlite3
from contextlib import contextmanager
from typing import Generator

from app import config


def initialize_database() -> None:
    with sqlite3.connect(config.DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT NOT NULL CHECK (category IN ('WORKOUT', 'DIET')),
                is_pinned INTEGER NOT NULL DEFAULT 0,
                background_color TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                has_been_edited INTEGER NOT NULL DEFAULT 0
            )
            """
        )


@contextmanager
def get_connection() -> Generator[sqlite3.Connection, None, None]:
    connection = sqlite3.connect(config.DB_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()
