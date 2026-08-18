/**
 * Sube al bucket los archivos que quedaron en backend/uploads/ y actualiza la
 * base para que apunten a la URL del bucket.
 *
 * Se necesita porque el respaldo local de bucketService nunca reintenta: si el
 * bucket estuvo caído en el momento de registrar una dotación, esas filas se
 * quedaron con el prefijo `local:` para siempre.
 *
 * Uso:
 *   node scripts/migrar-uploads-al-bucket.js            # sólo informa, no toca nada
 *   node scripts/migrar-uploads-al-bucket.js --aplicar  # sube y actualiza la base
 *   node scripts/migrar-uploads-al-bucket.js --aplicar --borrar-local
 *
 * Es idempotente: las filas ya migradas no vuelven a subirse.
 */

import fsp from 'fs/promises';
import path from 'path';
import sequelize from '../config/connection.js';
import { subirArchivo } from '../services/bucketService.js';

const APLICAR = process.argv.includes('--aplicar');
const BORRAR_LOCAL = process.argv.includes('--borrar-local');

const PREFIJO_LOCAL = 'local:';
const RAIZ_UPLOADS = path.resolve('uploads');

// Cada sitio de la base que guarda una ruta de archivo.
const OBJETIVOS = [
  { tabla: 'actas', columna: 'acta_pdf', carpeta: 'actas', etiqueta: 'Acta' },
  { tabla: 'dotacion_imagenes', columna: 'url', carpeta: 'imgs', etiqueta: 'Imagen' },
];

const MIME = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const resumen = { migrados: 0, fallidos: 0, sinArchivo: 0, borrados: 0 };

console.log(APLICAR
  ? '=== MIGRACIÓN REAL (se escribirá en la base) ==='
  : '=== SIMULACRO: no se modifica nada. Añada --aplicar para ejecutarlo ===');
console.log();

for (const { tabla, columna, carpeta, etiqueta } of OBJETIVOS) {
  const [filas] = await sequelize.query(
    `SELECT id, \`${columna}\` AS ruta FROM \`${tabla}\`
     WHERE \`${columna}\` LIKE '${PREFIJO_LOCAL}%'`
  );

  console.log(`${tabla}.${columna}: ${filas.length} fila(s) en local`);

  for (const fila of filas) {
    const relativa = fila.ruta.slice(PREFIJO_LOCAL.length);
    const absoluta = path.resolve(RAIZ_UPLOADS, relativa);

    // No salirse de uploads/ aunque la ruta de la base venga manipulada.
    if (!absoluta.startsWith(RAIZ_UPLOADS + path.sep)) {
      console.log(`  ✗ id ${fila.id}: ruta fuera de uploads/ (${relativa})`);
      resumen.fallidos++;
      continue;
    }

    let buffer;
    try {
      buffer = await fsp.readFile(absoluta);
    } catch {
      console.log(`  ! id ${fila.id}: el archivo ya no está en disco (${relativa})`);
      resumen.sinArchivo++;
      continue;
    }

    const nombre = path.basename(relativa);
    const ext = path.extname(nombre).toLowerCase();

    if (!APLICAR) {
      console.log(`  · id ${fila.id}: ${etiqueta} "${nombre}" (${(buffer.length / 1024).toFixed(1)} KB) se subiría`);
      continue;
    }

    try {
      const r = await subirArchivo(
        { buffer, originalname: nombre, mimetype: MIME[ext] || 'application/octet-stream' },
        carpeta
      );

      if (r.data.storage !== 'bucket') {
        throw new Error('acabó en disco otra vez');
      }

      await sequelize.query(
        `UPDATE \`${tabla}\` SET \`${columna}\` = :direccion WHERE id = :id`,
        { replacements: { direccion: r.data.direccion, id: fila.id } }
      );

      console.log(`  ✓ id ${fila.id}: ${etiqueta} → ${r.data.key}`);
      resumen.migrados++;

      if (BORRAR_LOCAL) {
        await fsp.unlink(absoluta);
        resumen.borrados++;
      }
    } catch (e) {
      console.log(`  ✗ id ${fila.id}: ${e.message}`);
      resumen.fallidos++;
    }
  }
  console.log();
}

console.log('=== Resumen ===');
console.log(`  migrados        : ${resumen.migrados}`);
console.log(`  fallidos        : ${resumen.fallidos}`);
console.log(`  sin archivo     : ${resumen.sinArchivo}`);
if (BORRAR_LOCAL) console.log(`  borrados de disco: ${resumen.borrados}`);

await sequelize.close();
process.exit(resumen.fallidos > 0 ? 1 : 0);
