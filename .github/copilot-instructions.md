# Copilot instructions for `tracker`

## Current repository state
- Source of truth is still `specifics.md`, but runnable code now exists in `backend/` and `frontend/`.
- Keep changes aligned with both the implemented code and the product constraints in `specifics.md`.
- Prefer minimal, incremental edits over broad refactors (project is early-stage and compact).

## Product and domain constraints
- App scope is a **single-user local web app** for workout/diet notes only (see `specifics.md` sections 1 and 8).
- Exactly three UI tabs are required: `Workout`, `Diet`, `Current (Pinned)`.
- A note has one primary category (`WORKOUT` or `DIET`) and can additionally appear in `Current` when pinned.

## Architecture and boundaries
- Frontend is React + TypeScript + Vite with MVP folders under `frontend/src/{model,presenter,view}`.
- Backend is FastAPI + SQLite with strict layering under `backend/app/{routers,services,repositories}`.
- Keep handlers thin in `backend/app/routers/notes.py`; business logic belongs in `services`, DB access in `repositories`.
- Database is file-based SQLite (`backend/data/tracker.db`) and must persist across sessions.

## Data/API contracts to preserve
- Note fields expected by spec: `id`, `title`, `content`, `category`, `is_pinned`, `background_color`, `created_at`, `updated_at`.
- Implemented endpoints in `backend/app/routers/notes.py`:
  - `GET /notes`, `POST /notes`, `GET /notes/{id}`
  - `PUT /notes/{id}`, `DELETE /notes/{id}`
  - `PATCH /notes/{id}/pin` (expects `{ "is_pinned": boolean }`)
- Query behavior to support: `?category=workout|diet`, `?pinned=true`.

## UX/behavior requirements
- Default ordering is by `created_at desc`; after edits, list behavior switches to `updated_at desc`.
- Pinned notes must always appear in `Current` without changing `Workout`/`Diet` ordering rules.
- Notes are card-based and editable (`title`, rich text content, color, pin state).

## Developer workflows (verified)
- Backend setup/test:
  - `cd backend && python3 -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`
  - `pytest -q`
  - `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
- Frontend setup/build:
  - `cd frontend && npm install`
  - `npm test`
  - `npm run dev -- --host 127.0.0.1 --port 5173`
  - `npm run build`
- Easy start interface:
  - `./scripts/start.zsh` (starts backend + frontend and opens browser; uses repo `.venv` automatically)
  - macOS double-click: `start.command`

## Project-specific conventions
- Keep Python typing compatible with the repo runtime (currently Python 3.9), so avoid `X | Y` union syntax in runtime-inspected signatures.
- Keep note category values uppercase in storage/API (`WORKOUT`, `DIET`); query filters can remain lowercase (`workout`, `diet`).
- Preserve presenter orchestration in `frontend/src/presenter/useNotesPresenter.ts` (data fetch/mutations), and keep UI components in `view/` declarative.
- When adding features, update both `README.md` and this file with real commands/paths used by the codebase.