import sequelize from '../config/connection.js';
import { DataTypes } from 'sequelize';

import { subirArchivo, resolverUrl } from '../services/bucketService.js';

import EscuelaModel from '../models/Escuela.js';
import DotacionModel from '../models/Dotacion.js';
import BeneficiarioModel from '../models/Beneficiado.js';
import ActaModel from '../models/Acta.js';
import DotacionImagenModel from '../models/DotacionImagen.js';
import EquipoModel from '../models/Equipo.js';
import DotacionEquipoModel from '../models/DotacionEquipo.js';
import TipoEquipo from '../models/TipoEquipo.js';
import ModeloEquipo from '../models/ModeloEquipo.js';
import Departamento from '../models/Departamento.js';
import Municipio from '../models/Municipio.js';
import fs from 'fs';
import { logAction } from '../services/auditService.js';
import { errorServidor } from '../utils/http.js';
import logger from '../utils/logger.js';


const Escuela = EscuelaModel;
const Dotacion = DotacionModel;
const Beneficiario = BeneficiarioModel;
const Acta = ActaModel;
const DotacionImagen = DotacionImagenModel;
const Equipo = EquipoModel;
const DotacionEquipo = DotacionEquipoModel;


export const createDotacion = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {

    const {
      codigoEscuela,
      estudiantesHombres,
      estudiantesMujeres,
      docentesBeneficiados,
      nombreDirector,
      telefono,
      correo,
      departamento,
      municipio,
      direccion,
      nombreEscuela,
      descripcionEntrega
    } = req.body;

    const ORIGENES = ['DONACION', 'COMPRA'];

    let equipos = [];
    if (req.body.equipos) {
      equipos = JSON.parse(req.body.equipos);
    }

    const actasPdf = req.files?.['acta_pdf'] || [];
    const fotos = req.files?.['imagenes_entrega'] || [];

    // El front manda un PDF por acta en `acta_pdf` y, en paralelo, un JSON
    // `actas` con el número, la fecha y el origen de cada una EN EL MISMO
    // ORDEN. Se emparejan por índice, así que ambos arreglos tienen que venir
    // del mismo v-for.
    let actasMeta = [];
    if (req.body.actas) {
      try {
        actasMeta = JSON.parse(req.body.actas);
      } catch {
        await transaction.rollback();
        return res.status(400).json({ message: 'El campo `actas` no es un JSON válido' });
      }
    }

    if (!Array.isArray(actasMeta) || actasMeta.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe registrarse al menos un acta' });
    }

    if (actasMeta.length !== actasPdf.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Llegaron ${actasMeta.length} número(s) de acta y ${actasPdf.length} PDF(s): cada acta necesita su archivo`
      });
    }

    if (actasMeta.some((a) => !String(a?.numero ?? '').trim())) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Todas las actas necesitan número' });
    }

    // Cada acta trae su propia fecha y su propio origen.
    // La fecha se maneja como texto YYYY-MM-DD y se guarda sin convertir:
    // `fecha_entrega` es DATEONLY y pasarla por `new Date()` la corría un día
    // al reinterpretarla en la zona horaria del servidor.
    const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;

    const actasNormalizadas = actasMeta.map((a) => ({
      no_acta: String(a.numero).trim(),
      origen: String(a?.origen ?? '').trim().toUpperCase(),
      fecha_entrega: String(a?.fecha ?? '').trim(),
    }));

    if (actasNormalizadas.some((a) => !ORIGENES.includes(a.origen))) {
      await transaction.rollback();
      return res.status(400).json({
        message: `El origen de cada acta debe ser uno de: ${ORIGENES.join(', ')}`
      });
    }

    const fechaInvalida = actasNormalizadas.some((a) => {
      if (!ES_FECHA.test(a.fecha_entrega)) return true;
      // Descarta fechas con forma válida pero inexistentes (2026-02-31).
      const d = new Date(`${a.fecha_entrega}T00:00:00Z`);
      return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== a.fecha_entrega;
    });

    if (fechaInvalida) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Todas las actas necesitan una fecha de entrega válida (YYYY-MM-DD)'
      });
    }

    // La dotación conserva un origen y una fecha para que los filtros y
    // reportes que consultan a nivel de dotación sigan funcionando: se toman
    // los de la primera acta.
    const origenNormalizado = actasNormalizadas[0].origen;
    const fecha = actasNormalizadas[0].fecha_entrega;

    const actas = [];
    for (let i = 0; i < actasPdf.length; i++) {
      const result = await subirArchivo(actasPdf[i], 'actas');
      actas.push({
        ...actasNormalizadas[i],
        acta_pdf: result.data.direccion
      });
    }

    const fotosUrls = [];
    for (const file of fotos) {
      const result = await subirArchivo(file, 'imgs');
      fotosUrls.push(result.data.direccion);
    }


    const total =
      Number(estudiantesHombres || 0) +
      Number(estudiantesMujeres || 0) +
      Number(docentesBeneficiados || 0);

    let escuela = await Escuela.findOne({
      where: { codigoEscuela },
      transaction
    });

    if (!escuela) {

      const depto = await Departamento.findOne({
        where: { nombre: departamento },
        transaction
      });

      const muni = await Municipio.findOne({
        where: {
          nombre: municipio,
          departamentoId: depto.id
        },
        transaction
      });

      escuela = await Escuela.create({
        nombreEscuela,
        codigoEscuela,
        departamentoId: depto.id,
        municipioId: muni.id,
        direccion,
        telefono,
        correo,
        director: nombreDirector,
        cantidadEquipoEntregado: equipos.length,
        cantidadEstudiantesBeneficiados: total
      }, { transaction });

    } else {
      // El paso "Beneficiados" está deshabilitado en el front, así que estos
      // campos llegan vacíos: sólo se pisan si vienen con dato, para no borrar
      // el director/teléfono/correo que ya tenga registrada la escuela.
      if (nombreDirector) escuela.director = nombreDirector;
      if (telefono) escuela.telefono = telefono;
      if (correo) escuela.correo = correo;

      escuela.cantidadEquipoEntregado += equipos.length;
      escuela.cantidadEstudiantesBeneficiados += total;

      await escuela.save({ transaction });
    }

    const dotacion = await Dotacion.create({
      id_escuela: escuela.id,
      origen: origenNormalizado,
      fecha_entrega: fecha,
      descripcion: descripcionEntrega
    }, { transaction });

    await Beneficiario.create({
      escuela_id: escuela.id,
      ciclo_educativo: new Date().getFullYear(),
      hombres: estudiantesHombres,
      mujeres: estudiantesMujeres,
      docentes: docentesBeneficiados,
      total
    }, { transaction });


    await Acta.bulkCreate(
      actas.map(a => ({
        dotacion_id: dotacion.id,
        no_acta: a.no_acta,
        fecha_entrega: a.fecha_entrega,
        origen: a.origen,
        acta_pdf: a.acta_pdf
      })),
      { transaction }
    );


    if (fotosUrls.length > 0) {
      await DotacionImagen.bulkCreate(
        fotosUrls.map(url => ({
          dotacion_id: dotacion.id,
          url: url
        })),
        { transaction }
      );
    }



    if (equipos.length > 0) {
      const registros = equipos.map(e => ({
        dotacion_id: dotacion.id,
        equipo_id: e.id
      }));

      await DotacionEquipo.bulkCreate(registros, { transaction });
    }

    await transaction.commit();

    await logAction(req, {
      action: 'DOTACION_CREATED',
      module: 'DOTACIONES',
      resourceId: dotacion.id,
      description: `Registró una dotación con ${equipos.length} equipo(s) para la escuela ${codigoEscuela}`,
    });

    return res.status(201).json({
      message: 'Dotación registrada correctamente',
      dotacionId: dotacion.id
    });

  } catch (error) {
    await transaction.rollback();

    logger.error('❌ Error en createDotacion:', error);

    return errorServidor(res, '[Dotaciones]', error, "Error al crear la dotación");
  }
};


export const getDotaciones = async (req, res) => {
  try {
    const dotaciones = await Dotacion.findAll({
      include: [
        {
          model: Escuela,
          as: 'escuela',
          include: [
            {
              model: Beneficiario,
              as: 'beneficiarios'
            },
            {
              model: Departamento,
              as: "departamento"
            },
            {
              model: Municipio,
              as: "municipio"
            },
          ]
        },
        {
          model: Acta,
          as: 'actas'
        },
        {
          model: DotacionImagen,
          as: 'imagenes'
        },
        {
          model: Equipo,
          as: 'equipos',
          // Aquí incluimos el modelo y su tipo de manera anidada
          include: [
            {
              model: ModeloEquipo, // Cambia 'Modelo' por el nombre de tu clase importada
              as: 'modelo',  // Asegúrate que este alias coincida con tu asociación
              include: [
                {
                  model: TipoEquipo, // Cambia 'TipoModelo' por tu clase importada
                  as: 'tipo'         // Asegúrate que este alias coincida con tu asociación
                }
              ]
            }
          ],
          through: {
            attributes: [] 
          }
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Acta, as: 'actas' }, 'fecha_entrega', 'ASC']
      ]
    });

    // El front no debe saber si el archivo vive en el bucket o en disco: se le
    // entrega la URL ya resuelta junto a la clave original.
    const resultado = dotaciones.map((d) => {
      const plano = d.toJSON();

      plano.actas = (plano.actas || []).map((a) => ({
        ...a,
        url: resolverUrl(a.acta_pdf)
      }));

      plano.imagenes = (plano.imagenes || []).map((img) => ({
        ...img,
        url_publica: resolverUrl(img.url)
      }));

      return plano;
    });

    return res.status(200).json(resultado);

  } catch (error) {
    logger.error('❌ Error al obtener dotaciones:', error);

    return errorServidor(res, '[Dotaciones]', error, "Error al obtener dotaciones");
  }
};


/**
 * Añade fotos de evidencia a una dotación ya registrada.
 *
 * Las fotos dejaron de ser obligatorias al crear la dotación: muchas veces el
 * acta llega antes que las fotografías, y obligar a tenerlas retrasaba el
 * registro o llevaba a subir cualquier cosa para poder continuar. Esta ruta
 * cierra el ciclo: cuando aparezcan, se agregan sin tocar nada más.
 *
 * Sólo añade; no reemplaza lo que ya hubiera.
 */
export const agregarImagenes = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Identificador de dotación inválido' });
  }

  const fotos = req.files?.['imagenes_entrega'] || [];

  if (!fotos.length) {
    return res.status(400).json({ message: 'No se recibió ninguna imagen' });
  }

  try {
    const dotacion = await Dotacion.findByPk(id, {
      include: [{ model: Escuela, as: 'escuela', attributes: ['codigoEscuela'] }],
    });

    if (!dotacion) {
      return res.status(404).json({ message: 'La dotación no existe' });
    }

    /* La subida va fuera de la transacción a propósito: si el bucket falla, lo
       hace antes de tocar la base y no queda ninguna fila apuntando a un
       archivo que no existe. Con STORAGE_REQUIRE_BUCKET activo, `subirArchivo`
       lanza un error con mensaje para el usuario. */
    const direcciones = [];
    for (const file of fotos) {
      const result = await subirArchivo(file, 'imgs');
      direcciones.push(result.data.direccion);
    }

    const creadas = await DotacionImagen.bulkCreate(
      direcciones.map((url) => ({ dotacion_id: dotacion.id, url })),
      { returning: true }
    );

    await logAction(req, {
      action: 'DOTACION_IMAGENES_ADDED',
      module: 'DOTACIONES',
      resourceId: dotacion.id,
      description:
        `Agregó ${creadas.length} foto(s) de evidencia a la dotación ${dotacion.id}` +
        ` (escuela ${dotacion.escuela?.codigoEscuela ?? 'sin código'})`,
    });

    return res.status(201).json({
      message: `Se agregaron ${creadas.length} foto(s)`,
      imagenes: creadas.map((img) => ({
        id: img.id,
        url: resolverUrl(img.url),
      })),
    });

  } catch (error) {
    return errorServidor(res, '[Dotaciones] agregarImagenes', error, 'Error al agregar las fotos');
  }
};