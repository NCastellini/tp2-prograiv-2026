import { describe, it, expect, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';

describe('NoteService - getNote (Ejercicio 3)', () => {
  let service: NoteServiceImpl;
  let repo: SqliteNoteRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
  });

  it('devuelve la nota cuando el id existe', () => {
    const seeded = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const note = service.getNote(seeded.id);

    expect(note).toEqual(seeded);
  });

  it('devuelve la nota correcta cuando hay varias', () => {
    repo.create({ title: 'A', content: 'B' });
    const second = repo.create({ title: 'C', content: 'D' });

    const note = service.getNote(second.id);

    expect(note?.id).toBe(second.id);
    expect(note?.title).toBe('C');
  });

  it('devuelve undefined cuando el id no existe', () => {
    expect(service.getNote(999)).toBeUndefined();
  });
});