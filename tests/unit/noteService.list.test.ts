import { describe, it, expect, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';

describe('NoteService - listNotes (Ejercicio 2)', () => {
  let service: NoteServiceImpl;
  let repo: SqliteNoteRepository;

  beforeEach(() => {
    const db = createDb(':memory:');

    repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
  });

  it('devuelve una lista vacía cuando no hay notas', () => {
    const notes = service.listNotes();
    expect(notes).toEqual([]);
  });

  it('devuelve todas las notas cuando hay varias cargadas', () => {
    const first = repo.create({ title: 'Nota 1', content: 'Contenido 1' });
    const second = repo.create({ title: 'Nota 2', content: 'Contenido 2' });

    const notes = service.listNotes();

    expect(notes).toHaveLength(2);
    expect(notes).toEqual([first, second]);
  });
});