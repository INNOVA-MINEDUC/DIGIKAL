import axios from 'axios';
import FormData from 'form-data';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { extensionSegura } from '../utils/archivos.js';
import { REQUERIR_BUCKET } from '../config/env.js';
import dotenv from 'dotenv'
import logger from '../utils/logger.js';
dotenv.config()

/**
 * Almacenamiento de archivos en el bucket (COSMO) con respaldo local.
 *
 * Se intenta subir al bucket. Si no está configurado o falla (caído, sin red,
 * credenciales malas), el archivo se guarda en `backend/uploads/<carpeta>/`
 * en vez de perder la dotación entera: guardar el registro sin el acta sería
 * peor que guardarlo con el PDF en disco.
 *
 * En la base se guarda la dirección del archivo, no la clave cruda:
 *   - bucket → la URL pública completa `<STORAGE_SERVICE_URL>/<key>/view`,
 *     que el navegador abre directo (ese endpoint no pide X-API-Key).
 *   - local  → `local:<carpeta>/<nombre>`, con prefijo para poder distinguir
 *     después de dónde sirve cada archivo sin adivinar por la forma de la
 *     cadena.
 *
 * `resolverUrl()` traduce cualquiera de los dos —y las claves sueltas que
 * quedaron guardadas antes de este cambio— a una URL usable.
 *
 * Ojo: el bucket reconvierte las imágenes a WebP, así que la clave que
 * devuelve no conserva la extensión que se subió (foto.jpg → <uuid>.webp).
 * Por eso la dirección se arma siempre con la clave de la respuesta y nunca
 * con el nombre original del archivo.
 */

const PREFIJO_LOCAL = 'local:';

// app.js publica estas carpetas con express.static en /uploads/...
const RAIZ_UPLOADS = path.resolve('uploads');

const CARPETAS = {
  actas: 'actas',
  imgs: 'imgs',
};

/**
 * Nombres actuales de las variables (STORAGE_*), con los antiguos (BUCKET_*)
 * como respaldo para no romper despliegues que todavía no actualizaron su .env.
 */
const baseBucket = () => {
  const url = process.env.STORAGE_SERVICE_URL || process.env.BUCKET_API_URL;
  return url ? url.replace(/\/+$/, '') : null;
};

const apiKeyBucket = () => process.env.STORAGE_API_KEY || process.env.BUCKET_API_KEY;

const bucketConfigurado = () => Boolean(baseBucket() && apiKeyBucket());

/** URL pública de lectura: `/view` sirve el archivo sin pedir credenciales. */
const urlPublica = (key) => `${baseBucket()}/${key}/view`;

/**
 * Saca la clave del bucket de lo que haya guardado en la base: una URL
 * completa (`.../storage/<key>/view`) o la clave suelta de registros viejos.
 */
const extraerKey = (direccion) => {
  if (!direccion) return null;

  if (!/^https?:\/\//i.test(direccion)) return direccion;

  const sinQuery = direccion.split('?')[0];
  const partes = sinQuery.split('/').filter(Boolean);

  // La última parte es `view`/`url` cuando la dirección apunta al endpoint de
  // lectura; en ese caso la clave es la anterior.
  const ultima = partes[partes.length - 1];
  const key = (ultima === 'view' || ultima === 'url')
    ? partes[partes.length - 2]
    : ultima;

  return key ? decodeURIComponent(key) : null;
};

/** Perfil de archivo que corresponde a cada carpeta (ver utils/archivos.js). */
const PERFIL_POR_CARPETA = {
  actas: 'pdf',
  imgs: 'imagen',
};

/**
 * Nombre único y seguro.
 *
 * La extensión se deriva del tipo ya validado, no del nombre que envió el
 * usuario: es la extensión la que decide con qué Content-Type sirve
 * express.static el archivo, así que no puede venir de una cadena que controle
 * el cliente. Antes se conservaba tal cual, y un `payload.html` se acababa
 * sirviendo como página HTML desde el dominio de la API.
 */
const nombreUnico = (file, carpeta) => {
  const originalname = file?.originalname || '';
  const ext = extensionSegura(file, PERFIL_POR_CARPETA[carpeta] || 'pdf');

  const base = path
    .basename(originalname, path.extname(originalname))
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

  const nombre = nombreUnico(file, sub);
  await fsp.writeFile(path.join(destino, nombre), file.buffer);

  return `${PREFIJO_LOCAL}${sub}/${nombre}`;
};

/**
 * Sube un archivo y devuelve `{ data: { key, direccion, storage } }`.
 * `direccion` es lo que se guarda en la base; `carpeta` ('actas' o 'imgs')
 * sólo aplica al respaldo local.
 */
export const subirArchivo = async (file, carpeta = 'actas') => {
  let motivoFallo = 'motivo desconocido';

  if (bucketConfigurado()) {
    try {
      const form = new FormData();
      form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      const response = await axios.post(
        baseBucket(),
        form,
        {
          headers: {
            ...form.getHeaders(),
            'X-API-Key': apiKeyBucket()
          },
          timeout: 30000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      const key = response.data?.data?.key ?? response.data?.key;

      if (key) {
        return {
          data: {
            key,
            direccion: urlPublica(key),
            storage: 'bucket'
          }
        };
      }

      motivoFallo = 'el bucket respondió sin `key`';
      logger.error('[bucket] Respuesta sin `key`:', response.data);

    } catch (error) {
      motivoFallo = error.response
        ? `el bucket respondió HTTP ${error.response.status}`
        : (error.code || error.message);

      logger.error(
        '[bucket] Subida fallida (%s): %s',
        motivoFallo,
        JSON.stringify(error.response?.data ?? error.message).slice(0, 300)
      );
    }
  } else {
    motivoFallo = 'STORAGE_SERVICE_URL o STORAGE_API_KEY sin configurar';
  }

  /* El bucket no pudo con el archivo. Antes se guardaba en disco siempre y en
     silencio: la fila quedaba con el prefijo `local:`, nadie reintentaba y sólo
     se notaba al mirar la base. Con REQUERIR_BUCKET la operación falla y quien
     la lanzó se entera. */
  if (REQUERIR_BUCKET) {
    const error = new Error(
      `No se pudo guardar "${file.originalname}" en el almacenamiento: ${motivoFallo}. ` +
      'No se registró nada; vuelva a intentarlo en unos minutos.'
    );
    // El mensaje es para el usuario: dice qué pasó y qué hacer, sin exponer
    // rutas ni detalles internos. Ver utils/http.js.
    error.expuesto = true;
    error.status = 502;
    throw error;
  }

  logger.warn('[bucket] Respaldo local para "%s" (%s)', file.originalname, motivoFallo);
  const key = await guardarEnDisco(file, carpeta);
  return { data: { key, direccion: key, storage: 'local' } };
};

/** Traduce lo guardado en la base a una URL que el navegador pueda abrir. */
export const resolverUrl = (direccion) => {
  if (!direccion) return null;

  if (direccion.startsWith(PREFIJO_LOCAL)) {
    return `/uploads/${direccion.slice(PREFIJO_LOCAL.length)}`;
  }

  // Ya es una dirección completa (lo que se guarda desde este cambio en adelante).
  if (/^https?:\/\//i.test(direccion)) return direccion;

  // Registros viejos que guardaron sólo la clave del bucket.
  if (!bucketConfigurado()) return null;

  return urlPublica(direccion);
};

export const obtenerUrlFirmada = async (direccion) => resolverUrl(direccion);

export const eliminarArchivo = async (direccion) => {
  if (!direccion) return false;

  if (direccion.startsWith(PREFIJO_LOCAL)) {
    const relativa = direccion.slice(PREFIJO_LOCAL.length);
    const destino = path.resolve(RAIZ_UPLOADS, relativa);

    // No salirse de uploads/ aunque la dirección venga manipulada.
    if (!destino.startsWith(RAIZ_UPLOADS + path.sep)) {
      logger.error('Ruta fuera de uploads/, no se elimina:', direccion);
      return false;
    }

    try {
      await fsp.unlink(destino);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      logger.error('Error eliminando archivo local:', error.message);
      return false;
    }
  }

  if (!bucketConfigurado()) {
    logger.error('Bucket no configurado, no se elimina:', direccion);
    return false;
  }

  const key = extraerKey(direccion);
  if (!key) return false;

  try {
    await axios.delete(`${baseBucket()}/${key}`, {
      headers: { 'X-API-Key': apiKeyBucket() },
      timeout: 30000
    });
    return true;
  } catch (error) {
    logger.error('Error eliminando archivo:', error.response?.data || error.message);
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
