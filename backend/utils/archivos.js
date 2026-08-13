import path from 'path';

/**
 * Validación de archivos subidos.
 *
 * El filtro anterior solo miraba `file.mimetype`, que es una cabecera que
 * manda el cliente y se falsifica escribiéndola. Como el nombre conservaba la
 * extensión original y la carpeta se publica con express.static, se podía subir
 * `payload.html` declarándolo `application/pdf` y acabar con JavaScript
 * ejecutándose en el origen de la API.
 *
 * Aquí se comprueban tres cosas que tienen que coincidir: la extensión, el
 * mimetype declarado y los primeros bytes del archivo, que no se pueden
 * falsificar sin dejar de ser un archivo válido de ese tipo.
 */

/** Firmas reales (magic bytes) al inicio del archivo. */
const FIRMAS = {
  pdf:  [[0x25, 0x50, 0x44, 0x46]],                     // %PDF
  jpeg: [[0xFF, 0xD8, 0xFF]],
  png:  [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  // Los .xlsx son ZIP; los .xls antiguos usan el contenedor OLE2.
  zip:  [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06], [0x50, 0x4B, 0x07, 0x08]],
  ole2: [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]],
};

/** Perfiles admitidos: qué extensión, qué mimetype y qué firma debe traer. */
export const PERFILES = {
  pdf: {
    extensiones: ['.pdf'],
    mimetypes: ['application/pdf'],
    firmas: ['pdf'],
    etiqueta: 'PDF',
  },
  imagen: {
    extensiones: ['.jpg', '.jpeg', '.png'],
    mimetypes: ['image/jpeg', 'image/jpg', 'image/png'],
    firmas: ['jpeg', 'png'],
    etiqueta: 'imagen JPG o PNG',
  },
  excel: {
    extensiones: ['.xlsx', '.xls'],
    mimetypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    firmas: ['zip', 'ole2'],
    etiqueta: 'Excel (.xlsx o .xls)',
  },
};

const empiezaCon = (buffer, bytes) =>
  buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b);

/**
 * Comprueba nombre y mimetype. Se usa en el `fileFilter` de Multer, que corre
 * antes de tener el contenido completo.
 * @returns {string|null} motivo del rechazo, o null si pasa.
 */
export const validarMetadatos = (file, perfilNombre) => {
  const perfil = PERFILES[perfilNombre];
  if (!perfil) return 'Campo no válido';

  const nombre = file.originalname || '';

  // Un nombre con dos extensiones ("acta.pdf.html") o con separadores de ruta
  // es siempre intento de colar algo.
  if (/[\\/]/.test(nombre) || nombre.includes('\0')) {
    return 'Nombre de archivo no válido';
  }

  const ext = path.extname(nombre).toLowerCase();

  if (!perfil.extensiones.includes(ext)) {
    return `Extensión no permitida "${ext || 'sin extensión'}". Se espera ${perfil.etiqueta}.`;
  }

  if (!perfil.mimetypes.includes(file.mimetype)) {
    return `El archivo no es ${perfil.etiqueta}.`;
  }

  return null;
};

/**
 * Comprueba el contenido real. Multer usa memoryStorage, así que el búfer ya
 * está disponible cuando llega al controlador.
 * @returns {string|null} motivo del rechazo, o null si pasa.
 */
export const validarContenido = (file, perfilNombre) => {
  const perfil = PERFILES[perfilNombre];
  if (!perfil) return 'Campo no válido';

  const buffer = file.buffer;
  if (!buffer || !buffer.length) return 'El archivo está vacío';

  const coincide = perfil.firmas.some((clave) =>
    FIRMAS[clave].some((bytes) => empiezaCon(buffer, bytes))
  );

  if (!coincide) {
    return `El contenido de "${file.originalname}" no corresponde a ${perfil.etiqueta}.`;
  }

  return null;
};

/**
 * Extensión segura, derivada del tipo ya validado y no del nombre que envió el
 * usuario. Es lo que decide con qué Content-Type servirá el archivo
 * express.static, así que no puede salir de una cadena controlada por el cliente.
 */
export const extensionSegura = (file, perfilNombre) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const perfil = PERFILES[perfilNombre];

  if (perfil?.extensiones.includes(ext)) return ext;

  return perfilNombre === 'pdf' ? '.pdf' : '.bin';
};

/** Valida un lote entero; devuelve el primer motivo de rechazo o null. */
export const validarLote = (files = [], perfilNombre) => {
  for (const file of files) {
    const err = validarMetadatos(file, perfilNombre) || validarContenido(file, perfilNombre);
    if (err) return err;
  }
  return null;
};
