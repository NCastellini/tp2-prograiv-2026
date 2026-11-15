import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

import { makeApp } from '../../src/app';

describe('GET /notes/:id (Ejercicio 3)', () => {
    const app = makeApp(':memory:');

    beforeEach(async () => {
        await request(app).post('/__test__/reset');
    });

    it('obtiene una nota existente por su id', async () => {
        const responseCreate = await request(app)
            .post('/notes')
            .send({
                title: 'Comprar pan',
                content: 'Antes de las 20hs'
            });

        const id = responseCreate.body.id;

        const response = await request(app)
            .get(`/notes/${id}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(id);
        expect(response.body.title).toBe('Comprar pan');
        expect(response.body.content).toBe('Antes de las 20hs');
    });

    it('devuelve 404 si el id no existe', async () => {
        const response = await request(app)
            .get('/notes/999');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('NotFound');
    });

    describe('PATCH /notes/:id (Ejercicio 4)', () => {
    it('debe responder con 200 y modificar la nota parcialmente', async () => {

    const resCreate = await request(app)
        .post('/notes')
        .send({ title: 'Nota Inicial', content: 'Contenido Inicial' });

    const noteId = resCreate.body.id;

    const response = await request(app)
        .patch(`/notes/${noteId}`)
        .send({ title: 'Nota Modificada' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Nota Modificada');
    expect(response.body.content).toBe('Contenido Inicial');
    });
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