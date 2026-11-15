import { test, expect } from '@playwright/test';
import { resetAndSeed } from './helpers';

test.describe('E2E Notas', () => {
    
    // Resetea la base con datos de prueba
    test.beforeEach(async ({ baseURL }) => {await resetAndSeed(baseURL!);
    });

    // Test optimista
    test('Happy path: crear una nota y que aparezca en la lista', async ({ request }) => {
        // Estado inicial conocido. La semilla deja exactamente 2 notas
        // Verifica que el código de la respuesta sea 200 (OK)
        const antes = await request.get('/notes');
        expect(antes.status()).toBe(200);

        // Pasa la respuesta a json y verifica que haya exactamente 2 notas
        const inicial = await antes.json();
        expect(inicial).toHaveLength(2);

        // Crea una nota nueva y chequea que el código de respuesta sea 201 (Created)
        const nuevaNota = { title: 'Nota E2E', content: 'Contenido de prueba' };
        const creado = await request.post('/notes', { data: nuevaNota });
        expect(creado.status()).toBe(201);

        // Pasa la respuesta a json y verifica que coincida con el mismo objeto
        const nota = await creado.json();
        expect(nota).toMatchObject(nuevaNota);

        // Verifica que la nueva nota aparece en la lista y que la lista tiene ahora exactamente 3 notas
        const despues = await request.get('/notes');
        const notas = await despues.json();
        expect(notas).toHaveLength(3);
        expect(notas).toContainEqual(expect.objectContaining({ id: nota.id, title: nuevaNota.title }));
    });

    // Test pesimista
    test('Caso de error: rechaza una nota inválida y no modifica el estado inicial', async ({ request }) => {
        // Error provocado por el campo de título vacío, verifica que el código de error sea 400 (Bad Request)
        const respuesta = await request.post('/notes', { data: { title: '' } });
        expect(respuesta.status()).toBe(400);

        // Pasa la respuesta a json y verifica que efectivamente hubo un error
        const body = await respuesta.json();
        expect(body.error ?? body.message).toBeTruthy();

        // La lista inicial sigue igual, solo las 2 notas de la semilla
        const lista = await request.get('/notes');
        expect(await lista.json()).toHaveLength(2);
    });
});