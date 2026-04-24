import { FormEvent } from "react";

import { NoteCategory, NoteTab } from "../model/note";

interface FormState {
  title: string;
  content: string;
  category: NoteCategory;
  is_pinned: boolean;
  background_color: string;
}

interface NoteModalProps {
  activeTab: NoteTab;
  formState: FormState;
  isOpen: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  error: string | null;
  onChange: (nextState: FormState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

function toHexColor(color: string): string {
  const normalized = (color || "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : "#EAF4FF";
}

export function NoteModal({
  activeTab,
  formState,
  isOpen,
  isSubmitting,
  isEditing,
  error,
  onChange,
  onClose,
  onSubmit,
}: NoteModalProps) {
  if (!isOpen) {
    return null;
  }

  const modalTitle = isEditing ? "Edit Note" : `Create ${activeTab === "CURRENT" ? "Pinned" : activeTab} Note`;
  const selectedColor = toHexColor(formState.background_color);

  return (
    <div className="modal-overlay" role="presentation">
      <div aria-labelledby="note-modal-title" aria-modal="true" className="modal-panel" role="dialog">
        <div className="modal-header">
          <div>
            <h2 id="note-modal-title">{modalTitle}</h2>
            <p className="modal-subtitle">Use the same editor to create or update notes.</p>
          </div>
          <button className="secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <form className="note-form" onSubmit={onSubmit}>
          {error && <p className="feedback error">{error}</p>}

          <label>
            Title
            <input
              value={formState.title}
              onChange={(event) =>
                onChange({
                  ...formState,
                  title: event.target.value,
                })
              }
              placeholder="Enter note title"
              required
            />
          </label>

          <label>
            Content
            <textarea
              value={formState.content}
              onChange={(event) =>
                onChange({
                  ...formState,
                  content: event.target.value,
                })
              }
              rows={8}
              placeholder="Write details, lists, or emojis 💪"
            />
          </label>

          <div className="modal-field-grid">
            <label>
              Category
              <select
                value={formState.category}
                onChange={(event) =>
                  onChange({
                    ...formState,
                    category: event.target.value as NoteCategory,
                  })
                }
              >
                <option value="WORKOUT">Workout</option>
                <option value="DIET">Diet</option>
              </select>
            </label>

            <label>
              Background Color
              <input
                className="color-picker-input"
                value={selectedColor}
                onChange={(event) =>
                  onChange({
                    ...formState,
                    background_color: event.target.value,
                  })
                }
                type="color"
                aria-label="Background Color"
              />
            </label>
          </div>

          <label className="checkbox-label">
            <input
              checked={formState.is_pinned}
              onChange={(event) =>
                onChange({
                  ...formState,
                  is_pinned: event.target.checked,
                })
              }
              type="checkbox"
            />
            Show in Current (Pinned)
          </label>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Note"}
            </button>
            <button className="secondary" onClick={onClose} type="button" disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { FormState };
