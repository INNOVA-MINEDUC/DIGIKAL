/**
 * Genera versiones WebP optimizadas de las imágenes de public/.
 *
 * Motivo: las imágenes originales vienen del diseño a tamaño de impresión
 * (hasta 7000 px de ancho y 12 MB por archivo). "Sobre nosotros" llegaba a
 * pedir unos 39 MB sólo en imágenes, y el Dashboard 7.6 MB. Eso arruina el LCP,
 * que es una de las Core Web Vitals y cuenta para el posicionamiento en Google.
 *
 * Qué hace:
 *   · Reduce a un ancho máximo razonable para pantalla (nunca amplía).
 *   · Reencoda a WebP, que pesa entre un 60 % y un 90 % menos que el PNG
 *     equivalente y conserva la transparencia.
 *   · Escribe el resultado JUNTO al original, con extensión .webp.
 *
 * NO borra ni modifica ningún archivo original: si algo se ve mal, basta con
 * revertir la referencia en el componente.
 *
 * Uso:
 *   node scripts/optimizar-imagenes.mjs            # informa, no escribe nada
 *   node scripts/optimizar-imagenes.mjs --aplicar
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, relative } from 'path';

const APLICAR = process.argv.includes('--aplicar');

const RAIZ = 'public';

/** Nadie muestra una imagen a más de esto; el resto es peso desperdiciado. */
const ANCHO_MAXIMO = 1920;

/** Por debajo de esto no compensa tocar nada. */
const MINIMO_KB = 100;

/* Se incluye .webp a propósito: en public/ ya había WebP exportados desde el
   diseño que pesaban hasta 1.8 MB porque conservaban el tamaño original. Un
   .webp no está optimizado por el hecho de ser .webp. Al reencodarlos sobre sí
   mismos sólo se escribe si el resultado es MÁS pequeño (ver más abajo). */
const EXTENSIONES = ['.png', '.jpg', '.jpeg', '.webp'];

/** Se dejan fuera: los logos ya pesan poco y el favicon no es una foto. */
const EXCLUIR = ['/logos/', 'favicon', '.ico'];

const listar = async (dir) => {
  const salida = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) salida.push(...await listar(ruta));
    else if (EXTENSIONES.includes(extname(entrada.name).toLowerCase())) salida.push(ruta);
  }
  return salida;
};

const kb = (b) => (b / 1024).toFixed(0);

const archivos = await listar(RAIZ);

let totalAntes = 0;
let totalDespues = 0;
let procesados = 0;

console.log(APLICAR ? '=== Generando WebP ===' : '=== SIMULACRO (añada --aplicar para escribir) ===');
console.log();

for (const ruta of archivos) {
  const rel = '/' + relative(RAIZ, ruta).replace(/\\/g, '/');
  if (EXCLUIR.some((e) => rel.includes(e))) continue;

  const { size } = await stat(ruta);
  if (size / 1024 < MINIMO_KB) continue;

  /* Se lee a memoria ANTES de procesar. Cuando la entrada ya es .webp, origen
     y destino son el mismo archivo: si sharp lo mantuviera abierto para leer,
     escribir encima falla con EBUSY/UNKNOWN en Windows. */
  const { readFile } = await import('fs/promises');
  const entrada = await readFile(ruta);

  const meta = await sharp(entrada).metadata();
  const destino = ruta.replace(/\.(png|jpe?g)$/i, '.webp');

  // `withoutEnlargement` evita que una imagen pequeña se estire.
  const buffer = await sharp(entrada)
    .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();

  // Si el reencodado no mejora (imagen ya optimizada), se deja como está: no
  // tiene sentido perder calidad para ganar cero bytes.
  if (buffer.length >= size) continue;

  totalAntes += size;
  totalDespues += buffer.length;
  procesados++;

  const ahorro = (100 - (buffer.length / size) * 100).toFixed(0);
  console.log(
    `  ${String(kb(size)).padStart(6)} KB → ${String(kb(buffer.length)).padStart(5)} KB ` +
    `(-${String(ahorro).padStart(2)}%)  ${meta.width}px→${Math.min(meta.width, ANCHO_MAXIMO)}px  ${rel}`
  );

  if (APLICAR) {
    const { writeFile } = await import('fs/promises');
    await writeFile(destino, buffer);
  }
}

console.log();
console.log('=== Resumen ===');
console.log(`  imágenes procesadas : ${procesados}`);
console.log(`  antes               : ${(totalAntes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  después             : ${(totalDespues / 1024 / 1024).toFixed(1)} MB`);
console.log(`  ahorro              : ${(100 - (totalDespues / totalAntes) * 100).toFixed(0)} %`);
if (!APLICAR) console.log('\n  (no se escribió nada)');
