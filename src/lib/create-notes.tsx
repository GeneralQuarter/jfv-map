import { Note } from '@/models/note';
import { Accessor, createEffect, createMemo, createSignal, onMount } from 'solid-js';

type CreateNotes = [
  notes: Accessor<Note[]>,
  noteTags: Accessor<string[]>,
  upsertNote: (note: Note) => void,
  clearNote: (objectId: string) => void,
]

export default function createNotes(): CreateNotes {
  const [notes, setNotes] = createSignal<Note[]>([]);
  const cacheKey = 'jfv-notes-v1';

  const noteTags = createMemo<string[]>(() => {
    return [...notes().reduce((set, note) => {
      note.tags.forEach(t => set.add(t));
      return set;
    }, new Set<string>())]
  });

  const upsertNote = (note: Note) => {
    const _notes = notes();
    const index = _notes.findIndex(n => n.objectId === note.objectId);

    if (index === -1) {
      setNotes([..._notes, note]);
      return;
    }

    const newNotes = [..._notes];
    newNotes.splice(index, 1, note);
    setNotes(newNotes);
  }

  const clearNote = (objectId: string) => {
    const _notes = notes();
    const index = _notes.findIndex(n => n.objectId === objectId);

    if (index === -1) {
      return;
    }

    const newNotes = [..._notes];
    newNotes.splice(index, 1);
    setNotes(newNotes);
  }

  createEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(notes()));
  });

  onMount(() => {
    try {
      const _notes = JSON.parse(localStorage.getItem(cacheKey));
      setNotes(_notes ?? []);
    } catch (e) {}
  });

  return [notes, noteTags, upsertNote, clearNote];
}
