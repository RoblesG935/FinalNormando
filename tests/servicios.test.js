const request = require('supertest');
const app = require('../src/app');
const { eleccionNumero, eleccionEquipo, crearJuego, obtenerInfoJuego, actualizarSecuencia } = require('../src/servicios/logicaJuego');

jest.mock('../src/servicios/logicaJuego', () => ({
    eleccionNumero: jest.fn(() => 1),
    eleccionEquipo: jest.fn(ids => Promise.resolve(ids.map(id => ({
        identificador: id, 
        nombre: `Pokemon-${id}`, 
        imagenUrl: `url-${id}`
    })))),
    crearJuego: jest.fn(equipoInicial => Promise.resolve({ 
        _id: '12345', 
        initialTeam: equipoInicial, 
        pokemonSequence: [] 
    })),
    obtenerInfoJuego: jest.fn(idJuego => Promise.resolve({
        _id: '12345',
        initialTeam: [1, 2, 3, 4, 5, 6],
        pokemonSequence: [1]
    })),
    actualizarSecuencia: jest.fn((idJuego, nuevoPokemon) => Promise.resolve({
        _id: '12345',
        initialTeam: [1, 2, 3, 4, 5, 6],
        pokemonSequence: [1, nuevoPokemon]
    })),
}));

describe('Integración de juegoController', () => {
    describe('GET /crearJuego', () => {
        it('debe iniciar un juego correctamente', async () => {
            const res = await request(app).get('/crearJuego');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('idJuego');
            expect(res.body).toHaveProperty('equipoInicial');
            expect(res.body.equipoInicial.length).toBe(6);
            expect(res.body).toBe[""];
        });

        it('debe manejar un error al iniciar el juego', async () => {
            eleccionEquipo.mockImplementationOnce(() => Promise.reject(new Error('Error en eleccionEquipo')));

            const res = await request(app).get('/crearJuego');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toBe('Error iniciando el juego: Error en eleccionEquipo');
        });
    });

    describe('POST /enviarSecuencia', () => {
        it('debe continuar la secuencia correctamente', async () => {
            const res = await request(app)
                .post('/enviarSecuencia')
                .send({ idJuego: '12345', pokemons: [1] });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('resultado', 'SEGUIR');
            expect(res.body.pokemonSequence.length).toBe(2);
        });

        it('debe manejar un error al comparar la secuencia', async () => {
            obtenerInfoJuego.mockImplementationOnce(() => Promise.reject(new Error('Juego no encontrado')));

            const res = await request(app)
                .post('/enviarSecuencia')
                .send({ idJuego: '12345', pokemons: [1] });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toBe('Error comparando la secuencia: Juego no encontrado');
        });
    });
});
