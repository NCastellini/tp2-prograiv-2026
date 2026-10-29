import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeApp } from '../../src/app';
import { createDb } from '../../src/db/connection';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';

describe('GET /notes/:id (Ejercicio 3)', () => {
    let dir: string;
    let app: ReturnType<typeof makeApp>;
    let db: ReturnType<typeof createDb>;
    let repo: SqliteNoteRepository;

    beforeEach(() => {
        // Base en un archivo temporal: la app y el test usan el mismo archivo,
        // así podemos sembrar una nota sin depender de POST /notes.
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-'));
        const dbPath = path.join(dir, 'test.sqlite');
        app = makeApp(dbPath);
        db = createDb(dbPath);
        repo = new SqliteNoteRepository(db);
    });

    afterEach(() => {
        db.close();
        fs.rmSync(dir, { recursive: true, force: true });
    });

    it('responde 200 y la nota cuando el id existe', async () => {
        const seeded = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

        const res = await request(app).get(`/notes/${seeded.id}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: seeded.id,
            title: 'Comprar pan',
            content: 'Antes de las 20hs',
            pinned: false
        });
    });

    it('responde 404 cuando el id no existe', async () => {
        const res = await request(app).get('/notes/999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'NotFound' });
    });
});