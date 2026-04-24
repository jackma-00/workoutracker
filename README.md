# Personal Workout & Diet Tracker

Local single-user note tracker for workout and diet planning, built with:
- Frontend: React + TypeScript (MVP pattern)
- Backend: FastAPI + SQLite (`router -> service -> repository`)

## Project structure

```text
backend/
  app/
    routers/
    services/
    repositories/
frontend/
  src/
    model/
    presenter/
    view/
scripts/
  start.zsh
start.command
```

## Quick start (manual)

### 1) Backend

```zsh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2) Frontend

```zsh
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173`.

## Easy start interface

After dependencies are installed, run one command from repo root:

```zsh
chmod +x scripts/start.zsh start.command
./scripts/start.zsh
```

The launcher uses the repo virtual environment at `.venv/` automatically for the backend.
On macOS you can also double-click `start.command`.

## Tests

Backend:

```zsh
cd backend
../.venv/bin/python -m pytest -q
```

Frontend:

```zsh
cd frontend
npm test
npm run build
```

## API summary

- `GET /notes`
- `POST /notes`
- `GET /notes/{id}`
- `PUT /notes/{id}`
- `DELETE /notes/{id}`
- `PATCH /notes/{id}/pin`

Filters:
- `GET /notes?category=workout|diet`
- `GET /notes?pinned=true`

## Persistence

Data is persisted in SQLite at `backend/data/tracker.db`, so notes survive across app sessions.
