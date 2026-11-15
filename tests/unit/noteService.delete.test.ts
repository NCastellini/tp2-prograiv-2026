import { describe, it, expect, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';
import { createECDH } from 'crypto';

describe('NoteService - deleteNote (Ejercicio 5)', () => {
    let service: NoteServiceImpl;
    let repo: SqliteNoteRepository;

    beforeEach(() => {
        const db = createDb(':memory:');
        repo = new SqliteNoteRepository(db);
        service = new NoteServiceImpl(repo);
    });

    it('elimina una nota existente y devuelve true', () => {
        const creada = repo.create({
            title: 'Comprar pan',
            content: 'Antes de las 20hs'
        });

        const resultado = service.deleteNote(creada.id);

        expect(resultado).toBe(true);
    });

    it('la nota eliminada ya no esta en el repositorio', () => {
        const creada = repo.create({
            title: 'Llamar al dentista',
            content: 'Turno de control'
        });

        service.deleteNote(creada.id);

        expect(repo.findById(creada.id)).toBeUndefined();
        expect(service.listNotes()).toHaveLength(0);
    });

    it('devuelve false si el id de la nota no existe', () => {
        const creada = repo.create({
            title: 'Sacar la basura',
            content: 'Container azul'
        });

        expect(service.deleteNote(creada.id)).toBe(true);
        expect(service.deleteNote(creada.id)).toBe(false);
    });

    it('solo elimina la nota indicada y conserva las demas', () => {
        const primera = repo.create({ title: 'Nota 1', content: 'Contenido 1' });
        const segunda = repo.create({ title: 'Nota 2', content: 'Contenido 2' });
        const tercera = repo.create({ title: 'Nota 3', content: 'Contenido 3' });
        
        expect(service.deleteNote(segunda.id)).toBe(true);

        const restantes = service.listNotes();
        expect(restantes.map(n => n.id)).toEqual([primera.id, tercera.id]);
    });
});