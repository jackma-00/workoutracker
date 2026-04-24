import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Note, NoteCategory, NoteTab } from "../model/note";
import { useNotesPresenter } from "../presenter/useNotesPresenter";
import { FormState, NoteModal } from "./NoteModal";
import { NoteReadModal } from "./NoteReadModal";
import "./styles.css";

const tabs: { label: string; value: NoteTab }[] = [
  { label: "Current (Pinned)", value: "CURRENT" },
  { label: "Workout", value: "WORKOUT" },
  { label: "Diet", value: "DIET" },
];

const DRAFT_STORAGE_KEY = "tracker.noteDrafts.v1";

function defaultForm(activeTab: NoteTab): FormState {
  return {
    title: "",
    content: "",
    category: activeTab === "DIET" ? "DIET" : "WORKOUT",
    is_pinned: activeTab === "CURRENT",
    background_color: "#EAF4FF",
  };
}

export function NotesApp() {
  const {
    activeTab,
    setActiveTab,
    notes,
    isLoading,
    isMutating,
    loadError,
    actionError,
    statusMessage,
    refreshNotes,
    addNote,
    editNote,
    removeNote,
    togglePin,
    clearFeedback,
  } = useNotesPresenter();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [readingNote, setReadingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardSpans, setCardSpans] = useState<Record<number, number>>({});
  const listRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLElement | null>>({});
  const [draftsByTab, setDraftsByTab] = useState<Record<NoteTab, FormState>>(() => {
    const fallbackDrafts = {
      WORKOUT: defaultForm("WORKOUT"),
      DIET: defaultForm("DIET"),
      CURRENT: defaultForm("CURRENT"),
    };

    if (typeof window === "undefined") {
      return fallbackDrafts;
    }

    const storedDrafts = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!storedDrafts) {
      return fallbackDrafts;
    }

    try {
      return {
        ...fallbackDrafts,
        ...JSON.parse(storedDrafts),
      };
    } catch {
      return fallbackDrafts;
    }
  });
  const [formState, setFormState] = useState<FormState>(draftsByTab[activeTab]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftsByTab));
    }
  }, [draftsByTab]);

  useEffect(() => {
    if (!editingNote) {
      setFormState(draftsByTab[activeTab]);
    }
  }, [activeTab, editingNote, draftsByTab]);

  const title = useMemo(() => {
    return tabs.find((tab) => tab.value === activeTab)?.label ?? "Notes";
  }, [activeTab]);

  function onSelectTab(tab: NoteTab) {
    setActiveTab(tab);
    setEditingNote(null);
    setReadingNote(null);
    setIsModalOpen(false);
    clearFeedback();
  }

  function openCreateModal() {
    setEditingNote(null);
    setFormState(draftsByTab[activeTab]);
    setIsModalOpen(true);
    clearFeedback();
  }

  function onEdit(note: Note) {
    clearFeedback();
    setReadingNote(null);
    setEditingNote(note);
    setIsModalOpen(true);
    setFormState({
      title: note.title,
      content: note.content,
      category: note.category,
      is_pinned: note.is_pinned,
      background_color: note.background_color,
    });
  }

  function resetForm() {
    setEditingNote(null);
    const resetState = defaultForm(activeTab);
    setFormState(resetState);
    setDraftsByTab((current) => ({
      ...current,
      [activeTab]: resetState,
    }));
  }

  function closeModal() {
    setIsModalOpen(false);
    clearFeedback();
    if (editingNote) {
      setEditingNote(null);
      setFormState(draftsByTab[activeTab]);
    }
  }

  function openReadModal(note: Note) {
    clearFeedback();
    setReadingNote(note);
  }

  function closeReadModal() {
    setReadingNote(null);
  }

  function updateForm(nextState: FormState) {
    setFormState(nextState);
    if (!editingNote) {
      setDraftsByTab((current) => ({
        ...current,
        [activeTab]: nextState,
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    if (!formState.title.trim()) {
      return;
    }

    try {
      if (editingNote) {
        await editNote(editingNote.id, formState);
      } else {
        await addNote(formState);
      }
      resetForm();
      setIsModalOpen(false);
    } catch {
      return;
    }
  }

  useLayoutEffect(() => {
    const listElement = listRef.current;
    if (!listElement || notes.length === 0) {
      return;
    }

    const styles = window.getComputedStyle(listElement);
    const autoRows = parseInt(styles.getPropertyValue("grid-auto-rows"), 10);
    const rowGap = parseInt(styles.getPropertyValue("row-gap"), 10);

    if (!autoRows) {
      return;
    }

    const nextSpans: Record<number, number> = {};
    notes.forEach((note) => {
      const cardElement = cardRefs.current[note.id];
      if (!cardElement) {
        return;
      }

      const cardHeight = cardElement.getBoundingClientRect().height;
      const span = Math.max(1, Math.ceil((cardHeight + rowGap) / (autoRows + rowGap)));
      nextSpans[note.id] = span;
    });

    setCardSpans(nextSpans);
  }, [notes, activeTab]);

  return (
    <div className="page-shell">
      <header className="header-panel">
        <h1>Personal Workout & Diet Tracker</h1>
        <p>Focused local notes for training and nutrition.</p>
      </header>

      <nav className="tab-list" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            className={`tab-button ${activeTab === tab.value ? "active" : ""}`}
            key={tab.value}
            onClick={() => onSelectTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="toolbar-panel">
        <div>
          <h2>{title}</h2>
          <p className="toolbar-copy">All existing notes in this tab appear as cards below.</p>
        </div>
        <button onClick={openCreateModal} type="button">
          New Note
        </button>
      </section>

      <section className="cards-panel">
        {statusMessage && <p className="feedback success">{statusMessage}</p>}
        {isLoading && <p>Loading notes...</p>}
        {loadError && <p className="feedback error">{loadError}</p>}
        {!isLoading && notes.length === 0 && <p>No notes yet in this tab.</p>}

        <div className="note-list note-list-grid" ref={listRef}>
          {notes.map((note) => (
            <article
              className="note-card"
              key={note.id}
              ref={(element) => {
                cardRefs.current[note.id] = element;
              }}
              style={{
                backgroundColor: note.background_color,
                gridRowEnd: `span ${cardSpans[note.id] ?? 1}`,
              }}
              role="button"
              tabIndex={0}
              onClick={() => openReadModal(note)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openReadModal(note);
                }
              }}
              aria-label={`Open note ${note.title}`}
            >
              <div className="note-header">
                <h3>{note.title}</h3>
                <button
                  type="button"
                  className="secondary"
                  disabled={isMutating}
                  onClick={(event) => {
                    event.stopPropagation();
                    togglePin(note.id, !note.is_pinned);
                  }}
                >
                  {note.is_pinned ? "Unpin" : "Pin"}
                </button>
              </div>
              <p className="note-content">{note.content}</p>
              <p className="note-meta">
                {note.category} · Created {new Date(note.created_at).toLocaleString()}
              </p>
              <div className="note-actions">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(note);
                  }}
                  disabled={isMutating}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeNote(note.id);
                  }}
                  disabled={isMutating}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <NoteModal
        activeTab={activeTab}
        error={actionError}
        formState={formState}
        isEditing={Boolean(editingNote)}
        isOpen={isModalOpen}
        isSubmitting={isMutating}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <NoteReadModal isOpen={Boolean(readingNote)} note={readingNote} onClose={closeReadModal} onEdit={onEdit} />
    </div>
  );
}
