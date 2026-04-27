import { useCallback, useEffect, useMemo, useState } from "react";

import { createNote, deleteNote, listNotes, updateNote, updatePin } from "../model/noteApi";
import { Note, NoteCreatePayload, NoteTab, NoteUpdatePayload } from "../model/note";

const ACTIVE_TAB_STORAGE_KEY = "tracker.activeTab.v1";

function isNoteTab(value: unknown): value is NoteTab {
  return value === "WORKOUT" || value === "DIET" || value === "CURRENT";
}

function getInitialActiveTab(): NoteTab {
  if (typeof window === "undefined") {
    return "CURRENT";
  }

  const storedTab = window.localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  if (isNoteTab(storedTab)) {
    return storedTab;
  }

  return "CURRENT";
}

function getSortDate(note: Note): number {
  const createdAt = new Date(note.created_at).getTime();
  const updatedAt = new Date(note.updated_at).getTime();
  return updatedAt > createdAt ? updatedAt : createdAt;
}

function sortNotes(noteList: Note[]): Note[] {
  return [...noteList].sort((left, right) => getSortDate(right) - getSortDate(left));
}

export function useNotesPresenter() {
  const [activeTab, setActiveTab] = useState<NoteTab>(getInitialActiveTab);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const allNotes = await listNotes();
      setNotes(sortNotes(allNotes));
    } catch (requestError) {
      setLoadError(requestError instanceof Error ? requestError.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const visibleNotes = useMemo(() => {
    if (activeTab === "CURRENT") {
      return notes.filter((note) => note.is_pinned);
    }
    return notes.filter((note) => note.category === activeTab);
  }, [activeTab, notes]);

  const addNote = useCallback(
    async (payload: NoteCreatePayload) => {
      setIsMutating(true);
      setActionError(null);
      setStatusMessage(null);
      try {
        const createdNote = await createNote(payload);
        setNotes((current) => sortNotes([createdNote, ...current]));
        setStatusMessage("Note created successfully.");
        return createdNote;
      } catch (requestError) {
        setActionError(requestError instanceof Error ? requestError.message : "Failed to create note");
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const editNote = useCallback(
    async (noteId: number, payload: NoteUpdatePayload) => {
      setIsMutating(true);
      setActionError(null);
      setStatusMessage(null);
      try {
        const updatedNote = await updateNote(noteId, payload);
        setNotes((current) => sortNotes(current.map((note) => (note.id === noteId ? updatedNote : note))));
        setStatusMessage("Note updated successfully.");
        return updatedNote;
      } catch (requestError) {
        setActionError(requestError instanceof Error ? requestError.message : "Failed to update note");
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const removeNote = useCallback(
    async (noteId: number) => {
      setIsMutating(true);
      setActionError(null);
      setStatusMessage(null);
      try {
        await deleteNote(noteId);
        setNotes((current) => current.filter((note) => note.id !== noteId));
        setStatusMessage("Note deleted.");
      } catch (requestError) {
        setActionError(requestError instanceof Error ? requestError.message : "Failed to delete note");
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const togglePin = useCallback(
    async (noteId: number, isPinned: boolean) => {
      setIsMutating(true);
      setActionError(null);
      setStatusMessage(null);
      try {
        const updatedNote = await updatePin(noteId, isPinned);
        setNotes((current) => sortNotes(current.map((note) => (note.id === noteId ? updatedNote : note))));
        setStatusMessage(isPinned ? "Note pinned to Current." : "Note removed from Current.");
        return updatedNote;
      } catch (requestError) {
        setActionError(requestError instanceof Error ? requestError.message : "Failed to update pin state");
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const clearFeedback = useCallback(() => {
    setLoadError(null);
    setActionError(null);
    setStatusMessage(null);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
    }
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isMutating,
    loadError,
    actionError,
    statusMessage,
    notes: visibleNotes,
    allNotes: notes,
    refreshNotes,
    addNote,
    editNote,
    removeNote,
    togglePin,
    clearFeedback,
  };
}
