/**
 * Fuente de datos de las estadísticas de dotación / conectividad / formación.
 *
 * ⚠️ DATOS DE PRUEBA. Los registros de abajo son una semilla para poder montar
 * los dashboards; no provienen de la BD ni del API MDM. Para conectar los datos
 * reales basta reemplazar `obtenerRegistros()` por la consulta correspondiente
 * (Sequelize o GraphQL) siempre que devuelva la misma forma de registro. Todo lo
 * demás —agregaciones, totales, indicadores— se deriva de ahí.
 *
 * Un registro = un corte (departamento × ciclo × año). Todas las tablas del
 * dashboard son agrupaciones sobre esta misma lista, así que nunca pueden
 * contradecirse entre sí.
 */

export const CICLOS = ['PREPRIMARIA', 'PRIMARIA', 'BASICO', 'DIVERSIFICADO'];

export const ETIQUETAS_CICLO = {
  PREPRIMARIA: 'Preprimaria',
  PRIMARIA: 'Primaria',
  BASICO: 'Básico',
  DIVERSIFICADO: 'Diversificado',
};

/** Métricas sumables. Cualquier agregación recorre exactamente esta lista. */
export const METRICAS = [
  'establecimientos',
  'equipos',
  'beneficiados',
  'conectividad',
  'formacion',
  'proyectores',
  'impresoras',
];

export const ETIQUETAS_METRICA = {
  establecimientos: 'Establecimientos',
  equipos: 'Equipos entregados',
  beneficiados: 'Estudiantes beneficiados',
  conectividad: 'Con conectividad',
  formacion: 'Beneficiados con formación',
  proyectores: 'Proyectores',
  impresoras: 'Impresoras',
};

/**
 * Municipios impactados por departamento.
 *
 * Va aparte de los registros a propósito: NO es una métrica sumable. Los
 * registros de un mismo departamento comparten sus municipios, así que sumarla
 * por fila la multiplicaría. Es un atributo del departamento y se cuenta una
 * sola vez por departamento presente en el corte (ver `contarMunicipios()`).
 */
export const MUNICIPIOS_POR_DEPARTAMENTO = {
  'Guatemala': 10,
  'Alta Verapaz': 10,
  'Baja Verapaz': 7,
  'Sololá': 4,
  'Sacatepéquez': 8,
  'Chimaltenango': 8,
  'Quiché': 7,
  'Jalapa': 4,
  'Escuintla': 6,
  'Huehuetenango': 6,
  'Chiquimula': 6,
  'Retalhuleu': 5,
  'Quetzaltenango': 5,
  'Totonicapán': 4,
  'Izabal': 4,
  'Petén': 4,
  'El Progreso': 3,
  'Jutiapa': 3,
  'San Marcos': 3,
  'Suchitepéquez': 3,
  'Zacapa': 3,
  'Santa Rosa': 3,
};

// r(departamento, ciclo, año, establecimientos, equipos, beneficiados,
//   conectividad, formación, proyectores, impresoras)
const r = (
  departamento, ciclo, anio,
  establecimientos, equipos, beneficiados, conectividad, formacion, proyectores, impresoras
) => ({
  departamento, ciclo, anio,
  establecimientos, equipos, beneficiados, conectividad, formacion, proyectores, impresoras,
});

const REGISTROS = [
  r('Guatemala', 'PRIMARIA', 2025, 2, 26, 323, 2, 76, 1, 1),
  r('Guatemala', 'BASICO', 2025, 1, 13, 162, 1, 38, 0, 0),
  r('Guatemala', 'DIVERSIFICADO', 2025, 17, 223, 2747, 14, 644, 5, 9),
  r('Guatemala', 'BASICO', 2026, 2, 26, 323, 1, 76, 1, 1),
  r('Guatemala', 'DIVERSIFICADO', 2026, 24, 314, 3879, 20, 910, 7, 13),
  r('Alta Verapaz', 'PRIMARIA', 2025, 2, 26, 323, 2, 76, 1, 1),
  r('Alta Verapaz', 'DIVERSIFICADO', 2025, 13, 170, 2101, 11, 493, 4, 7),
  r('Alta Verapaz', 'BASICO', 2026, 2, 26, 323, 1, 76, 0, 1),
  r('Alta Verapaz', 'DIVERSIFICADO', 2026, 18, 236, 2910, 15, 682, 6, 9),
  r('Baja Verapaz', 'PRIMARIA', 2025, 2, 26, 323, 2, 76, 1, 1),
  r('Baja Verapaz', 'DIVERSIFICADO', 2025, 13, 170, 2101, 11, 493, 4, 7),
  r('Baja Verapaz', 'BASICO', 2026, 2, 26, 323, 1, 76, 0, 1),
  r('Baja Verapaz', 'DIVERSIFICADO', 2026, 18, 236, 2910, 15, 682, 6, 9),
  r('Sololá', 'PREPRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Sololá', 'DIVERSIFICADO', 2025, 11, 144, 1778, 9, 417, 3, 6),
  r('Sololá', 'BASICO', 2026, 2, 26, 323, 2, 76, 1, 1),
  r('Sololá', 'DIVERSIFICADO', 2026, 16, 210, 2586, 13, 607, 5, 8),
  r('Sacatepéquez', 'PREPRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Sacatepéquez', 'DIVERSIFICADO', 2025, 8, 105, 1293, 6, 303, 3, 4),
  r('Sacatepéquez', 'BASICO', 2026, 1, 13, 161, 1, 38, 0, 0),
  r('Sacatepéquez', 'DIVERSIFICADO', 2026, 12, 157, 1940, 10, 455, 4, 7),
  r('Chimaltenango', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Chimaltenango', 'DIVERSIFICADO', 2025, 8, 105, 1293, 6, 303, 3, 4),
  r('Chimaltenango', 'BASICO', 2026, 1, 13, 161, 1, 38, 0, 0),
  r('Chimaltenango', 'DIVERSIFICADO', 2026, 11, 144, 1778, 9, 417, 4, 6),
  r('Quiché', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Quiché', 'DIVERSIFICADO', 2025, 8, 105, 1293, 6, 303, 3, 4),
  r('Quiché', 'BASICO', 2026, 1, 13, 161, 1, 38, 0, 0),
  r('Quiché', 'DIVERSIFICADO', 2026, 11, 144, 1778, 9, 417, 4, 6),
  r('Jalapa', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 1, 1),
  r('Jalapa', 'DIVERSIFICADO', 2025, 7, 92, 1131, 6, 265, 2, 4),
  r('Jalapa', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Jalapa', 'DIVERSIFICADO', 2026, 10, 131, 1616, 8, 379, 3, 5),
  r('Escuintla', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Escuintla', 'DIVERSIFICADO', 2025, 7, 92, 1131, 6, 266, 3, 4),
  r('Escuintla', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Escuintla', 'DIVERSIFICADO', 2026, 9, 118, 1454, 7, 341, 3, 5),
  r('Huehuetenango', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Huehuetenango', 'DIVERSIFICADO', 2025, 7, 91, 1131, 6, 266, 3, 4),
  r('Huehuetenango', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Huehuetenango', 'DIVERSIFICADO', 2026, 9, 118, 1454, 7, 341, 3, 5),
  r('Chiquimula', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Chiquimula', 'DIVERSIFICADO', 2025, 6, 78, 970, 5, 228, 2, 3),
  r('Chiquimula', 'BASICO', 2026, 1, 13, 161, 1, 38, 0, 1),
  r('Chiquimula', 'DIVERSIFICADO', 2026, 8, 105, 1293, 6, 303, 3, 4),
  r('Retalhuleu', 'PRIMARIA', 2025, 1, 13, 162, 1, 38, 0, 1),
  r('Retalhuleu', 'DIVERSIFICADO', 2025, 5, 65, 808, 4, 190, 2, 3),
  r('Retalhuleu', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Retalhuleu', 'DIVERSIFICADO', 2026, 7, 92, 1131, 5, 265, 2, 3),
  r('Quetzaltenango', 'DIVERSIFICADO', 2025, 5, 65, 808, 4, 190, 2, 3),
  r('Quetzaltenango', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Quetzaltenango', 'DIVERSIFICADO', 2026, 6, 79, 969, 5, 227, 2, 3),
  r('Totonicapán', 'DIVERSIFICADO', 2025, 4, 52, 646, 3, 152, 1, 2),
  r('Totonicapán', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 1),
  r('Totonicapán', 'DIVERSIFICADO', 2026, 5, 66, 808, 4, 189, 2, 2),
  r('Izabal', 'DIVERSIFICADO', 2025, 3, 39, 485, 2, 114, 1, 2),
  r('Izabal', 'BASICO', 2026, 1, 13, 161, 1, 38, 0, 0),
  r('Izabal', 'DIVERSIFICADO', 2026, 5, 66, 808, 4, 189, 2, 3),
  r('Petén', 'DIVERSIFICADO', 2025, 3, 39, 485, 2, 114, 1, 2),
  r('Petén', 'BASICO', 2026, 1, 13, 161, 1, 38, 0, 0),
  r('Petén', 'DIVERSIFICADO', 2026, 5, 66, 808, 4, 189, 2, 3),
  r('El Progreso', 'DIVERSIFICADO', 2025, 3, 39, 485, 3, 114, 1, 2),
  r('El Progreso', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('El Progreso', 'DIVERSIFICADO', 2026, 4, 53, 646, 3, 151, 2, 2),
  r('Jutiapa', 'DIVERSIFICADO', 2025, 3, 39, 485, 3, 114, 1, 2),
  r('Jutiapa', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Jutiapa', 'DIVERSIFICADO', 2026, 4, 53, 646, 3, 151, 2, 2),
  r('San Marcos', 'DIVERSIFICADO', 2025, 3, 39, 485, 3, 114, 1, 2),
  r('San Marcos', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('San Marcos', 'DIVERSIFICADO', 2026, 4, 53, 646, 3, 151, 1, 2),
  r('Suchitepéquez', 'DIVERSIFICADO', 2025, 3, 39, 485, 3, 114, 1, 2),
  r('Suchitepéquez', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Suchitepéquez', 'DIVERSIFICADO', 2026, 4, 53, 646, 3, 151, 1, 2),
  r('Zacapa', 'DIVERSIFICADO', 2025, 3, 39, 485, 3, 114, 1, 2),
  r('Zacapa', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 0),
  r('Zacapa', 'DIVERSIFICADO', 2026, 4, 53, 646, 3, 151, 1, 2),
  r('Santa Rosa', 'DIVERSIFICADO', 2025, 2, 26, 323, 2, 76, 1, 1),
  r('Santa Rosa', 'BASICO', 2026, 1, 13, 162, 1, 38, 0, 1),
  r('Santa Rosa', 'DIVERSIFICADO', 2026, 3, 39, 485, 2, 114, 1, 1),
];

/**
 * Punto de entrada único a los datos. Es `async` a propósito: cuando se
 * enganche la BD real, este cuerpo cambia por la consulta y ni el controlador
 * ni las agregaciones se enteran.
 */
export const obtenerRegistros = async () => REGISTROS;
