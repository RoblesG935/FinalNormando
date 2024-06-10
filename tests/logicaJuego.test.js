// __tests__/logicaJuego.test.js
const axios = require('axios');
const { 
    eleccionNumero, 
    _getPokemonInfo, 
    eleccionEquipo, 
    crearJuego, 
    obtenerInfoJuego, 
    actualizarSecuencia 
} = require('../src/servicios/logicaJuego');
const Juego = require('../src/models/juegoModel');

// Mock de la base de datos
jest.mock('../src/models/juegoModel');
jest.mock('axios');

describe('Pruebas unitarias de logicaJuego.js', () => {
    describe('eleccionNumero', () => {
        test('Éxito: debe retornar un número dentro del rango', () => {
            const num = eleccionNumero(1, 10);
            expect(num).toBeGreaterThanOrEqual(1);
            expect(num).toBeLessThanOrEqual(10);
        });

        test('Error: debe lanzar un error si inicio es mayor que fin', () => {
            expect(() => eleccionNumero(10, 1)).toThrow('Rango inválido: inicio es mayor que fin');
        });
    });

    describe('_getPokemonInfo', () => {
        test('Éxito: debe obtener la información del Pokémon', async () => {
            axios.get.mockResolvedValue({
                data: {
                    id: 1,
                    name: 'bulbasaur',
                    sprites: {
                        front_default: 'url'
                    }
                }
            });

            const info = await _getPokemonInfo(1);
            expect(info).toEqual({
                identificador: 1,
                nombre: 'bulbasaur',
                imagenUrl: 'url'
            });
        });

        test('Error: debe lanzar un error si la API falla', async () => {
            axios.get.mockRejectedValue(new Error('Error en la API'));
            await expect(_getPokemonInfo(1)).rejects.toThrow('Error en la API');
        });
    });

    describe('eleccionEquipo', () => {
        test('Éxito: debe retornar un equipo de Pokémon', async () => {
            axios.get.mockResolvedValue({
                data: {
                    id: 1,
                    name: 'bulbasaur',
                    sprites: {
                        front_default: 'url'
                    }
                }
            });

            const equipo = await eleccionEquipo([1, 2, 3]);
            expect(equipo).toHaveLength(3);
        });

        test('Error: debe lanzar un error si la API falla', async () => {
            axios.get.mockRejectedValue(new Error('Error en la API'));
            await expect(eleccionEquipo([1, 2, 3])).rejects.toThrow('Error en la API');
        });
    });

    describe('crearJuego', () => {
        test('Éxito: debe crear un nuevo juego', async () => {
            Juego.prototype.save.mockResolvedValue({ _id: '123', initialTeam: [1, 2, 3], pokemonSequence: [] });
            const juego = await crearJuego([1, 2, 3]);
            expect(juego).toHaveProperty('_id', '123');
        });

        test('Error: debe lanzar un error si la base de datos falla', async () => {
            Juego.prototype.save.mockRejectedValue(new Error('Error en la base de datos'));
            await expect(crearJuego([1, 2, 3])).rejects.toThrow('Error en la base de datos');
        });
    });

    describe('obtenerInfoJuego', () => {
        test('Éxito: debe obtener la información del juego', async () => {
            Juego.findById.mockResolvedValue({ _id: '123', initialTeam: [1, 2, 3], pokemonSequence: [] });
            const juego = await obtenerInfoJuego('123');
            expect(juego).toHaveProperty('_id', '123');
        });

        test('Error: debe lanzar un error si el juego no se encuentra', async () => {
            Juego.findById.mockResolvedValue(null);
            await expect(obtenerInfoJuego('123')).rejects.toThrow('Juego no encontrado');
        });
    });

    describe('actualizarSecuencia', () => {
        test('Éxito: debe actualizar la secuencia del juego', async () => {
            Juego.findByIdAndUpdate.mockResolvedValue({ _id: '123', initialTeam: [1, 2, 3], pokemonSequence: [1] });
            const juego = await actualizarSecuencia('123', 2);
            expect(juego.pokemonSequence).toBe[1];

        });

        test('Error: debe lanzar un error si el juego no se encuentra', async () => {
            Juego.findByIdAndUpdate.mockResolvedValue(null);
            await expect(actualizarSecuencia('123', 2)).rejects.toThrow('Juego no encontrado para actualizar');
        });
    });
});
