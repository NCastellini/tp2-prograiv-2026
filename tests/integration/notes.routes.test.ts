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

describe('DELETE /notes/:id (Ejercicio 5)', () => {
    const app = makeApp(':memory:');

    beforeEach(async () => {
        await request(app).post('/__test__/reset');
    });

    it('elimina una nota existente y responde 204 sin cuerpo', async () => {
        const resCreate = await request(app)
            .post('/notes')
            .send({ title: 'Comprar pan', content: 'Antes de las 20hs' });

        const noteId = resCreate.body.id;

        const response = await request(app).delete(`/notes/${noteId}`);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    });

    it('luego de eliminar, la nota ya no existe y la lista queda vacia', async () => {
        const resCreate = await request(app)
            .post('/notes')
            .send({ title: 'Llamar al dentista', content: 'Turno de control' });

        const noteId = resCreate.body.id;

        await request(app).delete(`/notes/${noteId}`);

        const resGet = await request(app).get(`/notes/${noteId}`);
        expect(resGet.status).toBe(404);
        expect(resGet.body.error).toBe('NotFound');

        const resList = await request(app).get('/notes');
        expect(resList.status).toBe(200);
        expect(resList.body).toHaveLength(0);
    });

    it('devuelve 404 si el id no existe', async () => {
        const response = await request(app).delete('/notes/999');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('NotFound');
    });

    it('solo elimina la nota indicada y conserva las demas', async () => {
        const resA = await request(app).post('/notes').send({ title: 'Nota A', content: 'Contenido A' });
        const resB = await request(app).post('/notes').send({ title: 'Nota B', content: 'Contenido B' });
        const resC = await request(app).post('/notes').send({ title: 'Nota C', content: 'Contenido C' });

        const response = await request(app).delete(`/notes/${resB.body.id}`);
        expect(response.status).toBe(204);

        const resList = await request(app).get('/notes');
        expect(resList.body.map((n: { id: number }) => n.id)).toEqual([resA.body.id, resC.body.id]);
    });
});