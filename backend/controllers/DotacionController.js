import sequelize from '../config/connection.js';
import { DataTypes } from 'sequelize';


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
import Proyecto from "../models/Proyecto.js"


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
      fecha,
      departamento,
      municipio,
      direccion,
      nombreEscuela,
      descripcionEntrega
    } = req.body;


    let equipos = [];
    if (req.body.equipos) {
      equipos = JSON.parse(req.body.equipos);
    }

    const actaPdf = req.files?.['acta_pdf']?.[0] || null;
    const fotos = req.files?.['imagenes_entrega'] || [];

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

      if (!depto) {
        throw new Error('Departamento no encontrado');
      }

      const muni = await Municipio.findOne({
        where: { 
          nombre: municipio,
          departamentoId: depto.id
        },
        transaction
      });

      if (!muni) {
        throw new Error('Municipio no encontrado');
      }

      escuela = await Escuela.create({
        nombreEscuela: nombreEscuela,
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
    

      escuela.director = nombreDirector;
      escuela.telefono = telefono;
      escuela.correo = correo;

      escuela.cantidadEquipoEntregado += equipos.length;
      escuela.cantidadEstudiantesBeneficiados += total;

      await escuela.save({ transaction });
    }


    const dotacion = await Dotacion.create({
      id_escuela: escuela.id,
      id_proyecto: 1,
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

    if (actaPdf) {
      await Acta.create({
        dotacion_id: dotacion.id,
        fecha_entrega: fecha,
        acta_pdf: actaPdf.filename
      }, { transaction });
    }

    if (fotos.length > 0) {
      await DotacionImagen.bulkCreate(
        fotos.map(f => ({
          dotacion_id: dotacion.id,
          url: f.filename
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

    return res.status(201).json({
      message: 'Dotación registrada correctamente',
      dotacionId: dotacion.id
    });

  } catch (error) {
    await transaction.rollback();

    console.error('❌ Error en createDotacion:', error);

    return res.status(500).json({
      message: 'Error al crear la dotación',
      error: error.message
    });
  }
};


export const getDotaciones = async (req, res) => {
  try {
    const dotaciones = await Dotacion.findAll({
      include: [
            {
      model: Proyecto,
      as: 'proyecto'
    },
        {
          model: Escuela,
          as: 'escuela',
          include: [
            {
              model: Beneficiario,
              as: 'beneficiarios'
            }
          ]
        },
        {
          model: Acta,
          as: 'acta'
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
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(dotaciones);

  } catch (error) {
    console.error('❌ Error al obtener dotaciones:', error);

    return res.status(500).json({
      message: 'Error al obtener dotaciones',
      error: error.message
    });
  }
};