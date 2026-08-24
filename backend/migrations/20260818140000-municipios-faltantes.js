'use strict';

/**
 * Municipios que existen en el catálogo del MINEDUC pero no en la tabla local.
 *
 * El seeder de municipios se hizo con una lista anterior y se quedó en 334; el
 * API devuelve 340. Los que faltaban son municipios creados por el Congreso
 * entre 2008 y 2015, posteriores a esa lista.
 *
 * Consecuencia práctica: al registrar una dotación de una escuela en cualquiera
 * de ellos, `createDotacion` no encontraba el municipio y reventaba con
 * `TypeError: Cannot read properties of null (reading 'id')`.
 *
 * El departamento de cada uno sale del propio API (campo departamentoId), que
 * es la fuente autoritativa.
 *
 * Los nombres se guardan en minúsculas y con tilde, como el resto de la tabla.
 *
 * @type {import('sequelize-cli').Migration}
 */

const NUEVOS = [
  { nombre: 'raxruhá',            departamento: 'alta verapaz' },
  { nombre: 'sipacate',           departamento: 'escuintla' },
  { nombre: 'petatán',            departamento: 'huehuetenango' },
  { nombre: 'las cruces',         departamento: 'petén' },
  { nombre: 'la blanca',          departamento: 'san marcos' },
  { nombre: 'san josé la máquina', departamento: 'suchitepéquez' },
  { nombre: 'san jorge',          departamento: 'zacapa' },
];

export default {
  async up(queryInterface, Sequelize) {
    const [departamentos] = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM departamentos'
    );

    // La comparación va sin tildes por si el seeder los grabó de otra forma.
    const sinTildes = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const idPorDepto = new Map(departamentos.map((d) => [sinTildes(d.nombre), d.id]));

    const ahora = new Date();
    const filas = [];

    for (const m of NUEVOS) {
      const departamentoId = idPorDepto.get(sinTildes(m.departamento));

      if (!departamentoId) {
        console.warn(`[municipios-faltantes] Departamento no encontrado: ${m.departamento}. Se omite ${m.nombre}.`);
        continue;
      }

      // Idempotente: si alguien ya lo agregó a mano, no se duplica.
      const [existe] = await queryInterface.sequelize.query(
        'SELECT id FROM municipios WHERE departamentoId = :dep AND LOWER(nombre) = LOWER(:nom)',
        { replacements: { dep: departamentoId, nom: m.nombre } }
      );

      if (existe.length) continue;

      filas.push({
        nombre: m.nombre,
        departamentoId,
        createdAt: ahora,
        updatedAt: ahora,
      });
    }

    if (filas.length) {
      await queryInterface.bulkInsert('municipios', filas);
      console.log(`[municipios-faltantes] ${filas.length} municipio(s) agregado(s).`);
    }
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;
    await queryInterface.bulkDelete('municipios', {
      nombre: { [Op.in]: NUEVOS.map((m) => m.nombre) },
    });
  },
};
