import { Note } from "../model/note";

interface NoteReadModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export function NoteReadModal({ isOpen, note, onClose, onEdit }: NoteReadModalProps) {
  if (!isOpen || !note) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation">
      <div aria-labelledby="note-read-title" aria-modal="true" className="modal-panel modal-panel-read" role="dialog">
        <div className="modal-header">
          <div>
            <h2 id="note-read-title">{note.title}</h2>
            <p className="modal-subtitle">
              {note.category} · {note.is_pinned ? "Pinned in Current" : "Not pinned"}
            </p>
          </div>
          <button className="secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <article className="read-note-card" style={{ backgroundColor: note.background_color }}>
          <p className="read-note-content">{note.content}</p>
          <p className="note-meta">
            Created {new Date(note.created_at).toLocaleString()} · Updated {new Date(note.updated_at).toLocaleString()}
          </p>
        </article>

        <div className="form-actions">
          <button type="button" onClick={() => onEdit(note)}>
            Edit Note
          </button>
          <button className="secondary" type="button" onClick={onClose}>
            Back to Cards
          </button>
        </div>
      </div>
    </div>
  );
}
