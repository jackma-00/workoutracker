import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotesApp } from "./NotesApp";

vi.mock("../model/noteApi", () => ({
  listNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  updatePin: vi.fn(),
}));

import { createNote, deleteNote, listNotes, updateNote, updatePin } from "../model/noteApi";

const mockedListNotes = vi.mocked(listNotes);
const mockedCreateNote = vi.mocked(createNote);
const mockedUpdateNote = vi.mocked(updateNote);
const mockedDeleteNote = vi.mocked(deleteNote);
const mockedUpdatePin = vi.mocked(updatePin);

describe("NotesApp", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockedListNotes.mockResolvedValue([]);
    mockedCreateNote.mockResolvedValue({
      id: 1,
      title: "Workout draft",
      content: "Squats",
      category: "WORKOUT",
      is_pinned: false,
      background_color: "#EAF4FF",
      created_at: "2026-04-24T14:00:00Z",
      updated_at: "2026-04-24T14:00:00Z",
    });
    mockedUpdateNote.mockResolvedValue({
      id: 1,
      title: "Updated note",
      content: "Updated",
      category: "WORKOUT",
      is_pinned: false,
      background_color: "#EAF4FF",
      created_at: "2026-04-24T14:00:00Z",
      updated_at: "2026-04-24T15:00:00Z",
    });
    mockedDeleteNote.mockResolvedValue();
    mockedUpdatePin.mockResolvedValue({
      id: 1,
      title: "Pinned note",
      content: "Pinned",
      category: "WORKOUT",
      is_pinned: true,
      background_color: "#EAF4FF",
      created_at: "2026-04-24T14:00:00Z",
      updated_at: "2026-04-24T15:00:00Z",
    });
  });

  it("creates a note and shows success feedback", async () => {
    const user = userEvent.setup();
    render(<NotesApp />);

    await user.click(screen.getByRole("button", { name: "Workout" }));
    await user.click(screen.getByRole("button", { name: "New Note" }));
    await user.type(screen.getByPlaceholderText("Enter note title"), "Workout draft");
    await user.type(screen.getByPlaceholderText("Write details, lists, or emojis 💪"), "Squats");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    await waitFor(() => expect(mockedCreateNote).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Note created successfully.")).toBeInTheDocument();
    expect(await screen.findByText("Workout draft")).toBeInTheDocument();
  });

  it("keeps drafts when switching tabs", async () => {
    const user = userEvent.setup();
    render(<NotesApp />);

    await user.click(screen.getByRole("button", { name: "Workout" }));
    await user.click(screen.getByRole("button", { name: "New Note" }));
    const titleInput = screen.getByPlaceholderText("Enter note title");
    await user.type(titleInput, "Bench session");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: "Diet" }));
    await user.click(screen.getByRole("button", { name: "New Note" }));
    await user.type(screen.getByPlaceholderText("Enter note title"), "Meal prep");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: "Workout" }));
    await user.click(screen.getByRole("button", { name: "New Note" }));

    expect(screen.getByPlaceholderText("Enter note title")).toHaveValue("Bench session");
  });

  it("renders friendly fetch errors when backend is unavailable", async () => {
    mockedCreateNote.mockRejectedValue(new Error("Cannot reach the tracker backend. Start it with ./scripts/start.zsh and try again."));
    const user = userEvent.setup();
    render(<NotesApp />);

    await user.click(screen.getByRole("button", { name: "New Note" }));
    await user.type(screen.getByPlaceholderText("Enter note title"), "Push day");
    await user.click(screen.getByRole("button", { name: "Create Note" }));

    expect(
      await screen.findByText("Cannot reach the tracker backend. Start it with ./scripts/start.zsh and try again."),
    ).toBeInTheDocument();
  });

  it("shows pinned notes in Current tab", async () => {
    mockedListNotes.mockResolvedValue([
      {
        id: 1,
        title: "Pinned workout",
        content: "Rows",
        category: "WORKOUT",
        is_pinned: true,
        background_color: "#EAF4FF",
        created_at: "2026-04-24T14:00:00Z",
        updated_at: "2026-04-24T14:00:00Z",
      },
      {
        id: 2,
        title: "Diet note",
        content: "Protein",
        category: "DIET",
        is_pinned: false,
        background_color: "#FFFFFF",
        created_at: "2026-04-24T14:00:00Z",
        updated_at: "2026-04-24T14:00:00Z",
      },
    ]);

    const user = userEvent.setup();
    render(<NotesApp />);

    await waitFor(() => expect(mockedListNotes).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "Current (Pinned)" }));

    expect(await screen.findByText("Pinned workout")).toBeInTheDocument();
    expect(screen.queryByText("Diet note")).not.toBeInTheDocument();
  });

  it("opens the same modal pre-filled when editing", async () => {
    mockedListNotes.mockResolvedValue([
      {
        id: 7,
        title: "Existing workout",
        content: "Deadlifts",
        category: "WORKOUT",
        is_pinned: false,
        background_color: "#EAF4FF",
        created_at: "2026-04-24T14:00:00Z",
        updated_at: "2026-04-24T14:00:00Z",
      },
    ]);

    const user = userEvent.setup();
    render(<NotesApp />);

    await waitFor(() => expect(mockedListNotes).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "Workout" }));
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing workout")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Deadlifts")).toBeInTheDocument();
  });

  it("opens a card in read mode", async () => {
    mockedListNotes.mockResolvedValue([
      {
        id: 9,
        title: "Reader note",
        content: "Line one\nLine two\nLine three",
        category: "WORKOUT",
        is_pinned: true,
        background_color: "#F0F9FF",
        created_at: "2026-04-24T14:00:00Z",
        updated_at: "2026-04-24T15:00:00Z",
      },
    ]);

    const user = userEvent.setup();
    render(<NotesApp />);

    await waitFor(() => expect(mockedListNotes).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Open" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open note Reader note" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Reader note")).toBeInTheDocument();
    expect(within(dialog).getByText(/Line one/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Pinned in Current/)).toBeInTheDocument();
  });
});
