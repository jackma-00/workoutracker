export type NoteCategory = "WORKOUT" | "DIET";
export type NoteTab = "WORKOUT" | "DIET" | "CURRENT";

export interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  is_pinned: boolean;
  background_color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreatePayload {
  title: string;
  content: string;
  category: NoteCategory;
  is_pinned: boolean;
  background_color: string;
}

export interface NoteUpdatePayload extends NoteCreatePayload {}
