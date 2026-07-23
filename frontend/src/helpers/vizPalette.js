/**
 * Paleta de las gráficas de estadísticas.
 *
 * Los cinco tonos categóricos están en un orden fijo y validado: pasan la banda
 * de luminosidad, el piso de croma, la separación para daltonismo (peor par
 * adyacente ΔE 9.1, umbral 8) y el piso de visión normal (ΔE 19.6, umbral 15)
 * sobre superficie blanca. NO reordenar ni sustituir tonos sueltos sin volver a
 * validar: el orden es el mecanismo de seguridad, no decoración.
 *
 * Tres de los tonos quedan bajo 3:1 de contraste contra el blanco, así que toda
 * gráfica que los use lleva leyenda y etiquetas visibles (o la tabla de datos
 * debajo) — el color nunca carga solo la identidad de la serie.
 *
 * Los colores institucionales (#0d3b5d, #03bfcb) se reservan para texto y
 * cromo de la interfaz: como serie fallan la banda de luminosidad y el croma.
 */

/** Tonos categóricos, en orden fijo. El índice 0 se asigna primero, siempre. */
export const SERIES = [
  '#2a78d6', // azul
  '#008300', // verde
  '#e87ba4', // magenta
  '#eda100', // ámbar
  '#1baf7a', // aqua
];

/** Color de la serie n. Nunca se recicla: más de 5 series exige agrupar en "Otros". */
export const colorSerie = (indice) => SERIES[indice] ?? SERIES[SERIES.length - 1];

/**
 * Rampa secuencial de un solo tono (azul, claro → oscuro) para magnitud
 * continua: el mapa coroplético y el mapa de calor. Nunca un arcoíris.
 */
export const RAMPA_SECUENCIAL = [
  '#cde2fb',
  '#9ec5f4',
  '#6da7ec',
  '#3987e5',
  '#2a78d6',
  '#256abf',
  '#184f95',
  '#0d366b',
];

/**
 * Escala un valor a un paso de la rampa. `min` mapea al paso más claro
 * (cerca de cero) y `max` al más oscuro.
 */
export const colorSecuencial = (valor, min, max) => {
  if (!Number.isFinite(valor) || max <= min) return RAMPA_SECUENCIAL[0];
  const t = (valor - min) / (max - min);
  const paso = Math.round(t * (RAMPA_SECUENCIAL.length - 1));
  return RAMPA_SECUENCIAL[Math.min(RAMPA_SECUENCIAL.length - 1, Math.max(0, paso))];
};

/** Cromo: ejes, rejilla y tinta. Recesivo a propósito — los datos van al frente. */
export const CROMO = {
  superficie: '#ffffff',
  tintaPrimaria: '#0d3b5d',
  tintaSecundaria: '#52514e',
  tintaTenue: '#898781',
  rejilla: '#e1e0d9',
  linea: '#c3c2b7',
  sinDato: '#eaeaea',
};

export const formatearNumero = (valor) =>
  new Intl.NumberFormat('es-GT').format(Math.round(valor ?? 0));
