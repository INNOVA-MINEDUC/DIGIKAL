-- ════════════════════════════════════════════════════════════════════════
-- Agrega el estado 'no_coincide' a solicitudes_cambio_serie
-- ════════════════════════════════════════════════════════════════════════
-- Antes, cuando el personal marcaba que la serie escrita NO coincide con el
-- documento, la solicitud se quedaba con estado = 'pendiente' (para poder
-- corregirla o rechazarla después). El problema: se veía IDÉNTICA a una
-- solicitud que nadie ha revisado todavía, tanto en la bandeja como al
-- consultar el estado públicamente.
--
-- Este script agrega 'no_coincide' como un estado propio del ENUM, para que
-- quede como un paso más del flujo (pendiente → no_coincide/verificada →
-- rechazada/aprobada), visible aparte en vez de simulado con otra columna.
--
-- Ejecutar UNA sola vez contra la base de producción de tablets. Sólo cambia
-- la definición del ENUM: no toca ninguna fila existente (todas siguen con
-- el estado que ya tenían).
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE solicitudes_cambio_serie
  MODIFY COLUMN estado ENUM('pendiente','no_coincide','verificada','aprobada','rechazada')
  NOT NULL DEFAULT 'pendiente';
