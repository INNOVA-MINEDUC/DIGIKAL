import axios from 'axios';
import FormData from 'form-data';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv'
dotenv.config()

/**
 * Almacenamiento de archivos con respaldo local.
 *
 * Se intenta subir al bucket. Si no está configurado o falla (caído, sin red,
 * credenciales malas), el archivo se guarda en `backend/uploads/<carpeta>/`
 * en vez de perder la dotación entera: guardar el registro sin el acta sería
 * peor que guardarlo con el PDF en disco.
 *
 * Las claves locales se marcan con el prefijo `local:` para poder distinguir
 * después de dónde sirve cada archivo, sin tener que adivinar por la forma de
 * la cadena. `resolverUrl()` traduce cualquiera de los dos a una URL usable.
 */

const PREFIJO_LOCAL = 'local:';

// app.js publica estas carpetas con express.static en /uploads/...
const RAIZ_UPLOADS = path.resolve('uploads');

const CARPETAS = {
  actas: 'actas',
  imgs: 'imgs',
};

const bucketConfigurado = () => Boolean(process.env.BUCKET_API_URL);

/** Nombre único: conserva la extensión y evita colisiones y choques de nombre. */
const nombreUnico = (originalname) => {
  const ext = path.extname(originalname || '').toLowerCase();
  const base = path
    .basename(originalname || 'archivo', ext)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'archivo';

  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${base}${ext}`;
};

const guardarEnDisco = async (file, carpeta) => {
  const sub = CARPETAS[carpeta] || CARPETAS.actas;
  const destino = path.join(RAIZ_UPLOADS, sub);

  await fsp.mkdir(destino, { recursive: true });

  const nombre = nombreUnico(file.originalname);
  await fsp.writeFile(path.join(destino, nombre), file.buffer);

  return `${PREFIJO_LOCAL}${sub}/${nombre}`;
};

/**
 * Sube un archivo y devuelve `{ data: { key, storage } }`.
 * `carpeta` es 'actas' o 'imgs' y sólo aplica al respaldo local.
 */
export const subirArchivo = async (file, carpeta = 'actas') => {
  if (bucketConfigurado()) {
    try {
      const form = new FormData();
      form.append('file', file.buffer, file.originalname);

      const response = await axios.post(
        process.env.BUCKET_API_URL,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'X-API-Key': process.env.BUCKET_API_KEY
          },
          timeout: 30000
        }
      );

      const key = response.data?.data?.key ?? response.data?.key;

      if (key) {
        return { data: { key, storage: 'bucket' } };
      }

      console.error('El bucket respondió sin `key`:', response.data);

    } catch (error) {
      console.error(
        'Bucket no disponible, se guarda en disco:',
        error.response?.data || error.message
      );
    }
  }

  const key = await guardarEnDisco(file, carpeta);
  return { data: { key, storage: 'local' } };
};

/** Traduce una clave guardada en la base a una URL que el navegador pueda abrir. */
export const resolverUrl = (key) => {
  if (!key) return null;

  if (key.startsWith(PREFIJO_LOCAL)) {
    return `/uploads/${key.slice(PREFIJO_LOCAL.length)}`;
  }

  // Claves antiguas que ya venían como URL completa.
  if (/^https?:\/\//i.test(key)) return key;

  if (!bucketConfigurado()) return null;

  return `${process.env.BUCKET_API_URL}/${key}/view`;
};

export const obtenerUrlFirmada = async (filename) => resolverUrl(filename);

export const eliminarArchivo = async (key) => {
  if (!key) return false;

  if (key.startsWith(PREFIJO_LOCAL)) {
    const relativa = key.slice(PREFIJO_LOCAL.length);
    const destino = path.resolve(RAIZ_UPLOADS, relativa);

    // No salirse de uploads/ aunque la clave venga manipulada.
    if (!destino.startsWith(RAIZ_UPLOADS + path.sep)) {
      console.error('Ruta fuera de uploads/, no se elimina:', key);
      return false;
    }

    try {
      await fsp.unlink(destino);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      console.error('Error eliminando archivo local:', error.message);
      return false;
    }
  }

  try {
    await axios.delete(`${process.env.BUCKET_API_URL}/${key}`, {
      headers: { 'X-API-Key': process.env.BUCKET_API_KEY }
    });
    return true;
  } catch (error) {
    console.error('Error eliminando archivo:', error.response?.data || error.message);
    return false;
  }
};

export const subirMultiples = async (files, carpeta = 'actas') => {
  const resultados = [];

  for (const file of files) {
    resultados.push(await subirArchivo(file, carpeta));
  }

  return resultados;
};
