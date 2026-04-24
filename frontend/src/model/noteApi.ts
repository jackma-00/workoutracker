import { Note, NoteCategory, NoteCreatePayload, NoteUpdatePayload } from "./note";

function resolveApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  return "http://127.0.0.1:8000";
}

const API_BASE_URL = resolveApiBaseUrl();

function buildQuery(params: Record<string, string | boolean | undefined>): string {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      urlParams.set(key, String(value));
    }
  });
  return urlParams.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ detail: `Request failed with status ${response.status}` }));
    throw new Error(payload.detail || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function fetchFromApi(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${input}`, init);
  } catch {
    throw new Error("Cannot reach the tracker backend. Start it with ./scripts/start.zsh and try again.");
  }
}

export async function listNotes(filters?: {
  category?: Lowercase<NoteCategory>;
  pinned?: boolean;
}): Promise<Note[]> {
  const query = buildQuery({ category: filters?.category, pinned: filters?.pinned });
  const endpoint = query ? `/notes?${query}` : "/notes";
  const response = await fetchFromApi(endpoint);
  return parseResponse<Note[]>(response);
}

export async function createNote(payload: NoteCreatePayload): Promise<Note> {
  const response = await fetchFromApi(`/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<Note>(response);
}

export async function updateNote(noteId: number, payload: NoteUpdatePayload): Promise<Note> {
  const response = await fetchFromApi(`/notes/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<Note>(response);
}

export async function deleteNote(noteId: number): Promise<void> {
  const response = await fetchFromApi(`/notes/${noteId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete note (${response.status})`);
  }
}

export async function updatePin(noteId: number, isPinned: boolean): Promise<Note> {
  const response = await fetchFromApi(`/notes/${noteId}/pin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_pinned: isPinned }),
  });
  return parseResponse<Note>(response);
}
