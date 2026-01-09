import Coherer from '../security/Coherer.js'; // Ajusta la ruta según tu estructura
// Nota: Jest inyecta 'describe', 'test', 'expect' globalmente, no hace falta importarlos.

describe('🛡️ Módulo de Seguridad (Coherer)', () => {

    // Antes de todos los tests, configuramos el entorno
    beforeAll(() => {
        process.env.NICOLA_SECRET = 'test_secret_key_123';
    });

    // Limpiamos después (buena práctica)
    afterAll(() => {
        delete process.env.NICOLA_SECRET;
    });

    describe('Happy Path (Lo que debe salir bien)', () => {
        
        test('Debe firmar y verificar un token correctamente', () => {
            const payload = { userId: 1, role: 'admin' };
            const options = { expiresIn: '1h' };

            // 1. Firmar
            const token = Coherer.sign(payload, options);
            
            // Verificamos que sea un string y tenga 3 partes (header.payload.signature)
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);

            // 2. Verificar
            const decoded = Coherer.verify(token);

            // Verificamos que la data sea la misma
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
            
            // Verificamos que se haya agregado la expiración
            expect(decoded).toHaveProperty('exp');
        });
    });

    describe('Sad Path (Errores esperados)', () => {

        test('Debe fallar si no se define una expiración', () => {
            const payload = { userId: 1 };
            
            // En Jest, para probar errores, envolvemos la llamada en una función anónima () =>
            expect(() => {
                Coherer.sign(payload, {}); 

            }).toThrow('Expire time invalid');
        });

        test('Debe fallar si el token es basura', () => {
            const tokenBasura = 'esto.no.es.valido';

            expect(() => {
                Coherer.verify(tokenBasura);
            }).toThrow(); // Esperamos cualquier error (Firma inválida, malformado, etc.)
        });

        test('Debe fallar si la firma ha sido manipulada', () => {
            const tokenReal = Coherer.sign({ id: 1 }, { expiresIn: '1h' });
            const partes = tokenReal.split('.');
            
            // Hack: Cambiamos la firma (última parte) por otra cosa
            const tokenFalso = `${partes[0]}.${partes[1]}.FIRMA_FALSA`;

            expect(() => {
                Coherer.verify(tokenFalso);
            }).toThrow('Token Invalido');
        });
    });
});