import request from 'supertest';
import { createServer } from 'http';
import Remote from '../core/Remote.js'; // Ajusta la ruta si es necesario

describe('🚦 Router System (Remote.js)', () => {
    let router;
    let server;

    // Antes de todos los tests, configuramos una "App de Mentira"
    beforeAll(() => {
        router = new Remote();

        // 1. Ruta Básica
        router.get('/', (req, res) => {
            res.statusCode = 200;
            res.end('Hola Nicola');
        });

        // 2. Ruta con Parámetros
        router.get('/user/:id', (req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ id: req.params.id }));
        });

        // 3. Ruta Suicida (Async Error) - Para probar tu arreglo P0
        router.get('/crash', async (req, res) => {
            throw new Error('Boom Async!'); 
        });

        // Creamos el servidor nativo que usa tu Router
        server = createServer((req, res) => {
            // Tu router recibe (req, res, done)
            router.handle(req, res, (err) => {
                // Este es el "Final Handler" (lo que sería tu BlackBox o default)
                if (err) {
                    res.statusCode = 500;
                    res.end(err.message); // Devolvemos el error capturado
                } else {
                    res.statusCode = 404;
                    res.end('Not Found');
                }
            });
        });
    });

    describe('Rutas y Navegación', () => {
        test('GET / debe responder 200 OK', async () => {
            const response = await request(server).get('/');
            expect(response.statusCode).toBe(200);
            expect(response.text).toBe('Hola Nicola');
        });

        test('GET /unknown debe responder 404', async () => {
            const response = await request(server).get('/ruta-que-no-existe');
            expect(response.statusCode).toBe(404);
        });

        test('GET /user/123 debe capturar parámetros', async () => {
            const response = await request(server).get('/user/555');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ id: '555' });
        });
    });

    describe('🛡️ Blindaje de Errores (P0 Fix)', () => {
        test('Debe capturar errores en handlers async y no colgarse', async () => {
            // Si tu fix del principio funciona, esto devolverá 500.
            // Si NO funciona, este test dará timeout porque el servidor se quedará colgado.
            const response = await request(server).get('/crash');
            
            expect(response.statusCode).toBe(500);
            expect(response.text).toBe('Boom Async!');
        });
    });
});