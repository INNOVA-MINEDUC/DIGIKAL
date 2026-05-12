import Escuela from '../models/Escuela.js';
import Dotacion from '../models/Dotacion.js';
import Equipo from '../models/Equipo.js';
import ModeloEquipo from '../models/ModeloEquipo.js';
import DotacionImagen from '../models/DotacionImagen.js';
import TipoEquipo from '../models/TipoEquipo.js';
import Beneficiario from '../models/Beneficiado.js';
import Departamento from "../models/Departamento.js";
import Municipio from "../models/Municipio.js";
import Internet from "../models/Internet.js";
import {
  obtenerEstablecimientos
} from "../services/apiClient.js"




export const getEscuelasDotadas = async (req, res) => {

  try {

    const { dept, muni } = req.body

    let where = {}

    if (dept) {
      where['$departamento.nombre$'] = dept.toLowerCase()
    }

    if (muni) {
      where['$municipio.nombre$'] = muni.toLowerCase()
    }

const escuelas = await Escuela.findAll({

  where,

  include: [

    {
      model: Departamento,
      as: 'departamento',
      attributes: ['nombre']
    },

    {
      model: Municipio,
      as: 'municipio',
      attributes: ['nombre']
    },

{
  model: Beneficiario,
  as: 'beneficiarios',
  attributes: [
    'id',
    'ciclo_educativo',

    'hombres',
    'mujeres',
    'docentes',

    'mayas',
    'xincas',
    'garifunas',
    'otros',

    'edad_0_13',
    'edad_13_30',
    'edad_30_60',
    'edad_mas_60'
  ]
},

    {
      model: Dotacion,
      as: 'dotaciones',

      attributes: [
        'id',
        'id_internet'
      ],

      include: [
        {
          model: Equipo,
          as: 'equipos',
          attributes: ['id']
        }
      ]
    }

  ],

  attributes: [
    'id',
    'nombreEscuela',
    'codigoEscuela'
  ]
})

    /* =========================================
       TOTALES
    ========================================= */

  const totalEstudiantes = escuelas.reduce((acc, escuela) => {

  const totalBeneficiados = (escuela.beneficiarios || []).reduce(
    (sum, b) => {

      return sum +
        Number(b.hombres || 0) +
        Number(b.mujeres || 0) +
        Number(b.docentes || 0)

    },
    0
  )

  return acc + totalBeneficiados

}, 0)
console.log(totalEstudiantes)

const totalEquipos = escuelas.reduce((acc, escuela) => {

  const totalEscuelaEquipos = (escuela.dotaciones || []).reduce(
    (sum, d) => {

      return sum + (d.equipos?.length || 0)

    },
    0
  )

  return acc + totalEscuelaEquipos

}, 0)

console.log(totalEquipos)



    /* =========================================
       ESCUELAS CON INTERNET
    ========================================= */

    const totalInternet = escuelas.filter((escuela) => {

      return escuela.dotaciones?.some(
        (d) => d.id_internet !== null
      )

    }).length

    const totalEstablecimientos = escuelas.length

    return res.status(200).json({

      establecimientos: totalEstablecimientos,

      totalEstudiantes,

      totalEquipos,

      totalInternet,

      escuelas

    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({
      message: 'Error al obtener las escuelas',
      error: error.message
    })

  }
}


export const getEscuelaById = async (req, res) => {
  try {
    const { id } = req.params;

    const escuela = await Escuela.findByPk(id);

    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }

    return res.status(200).json(escuela);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al buscar escuela',
      error: error.message
    });
  }
};


export const createEscuela = async (req, res) => {
  try {
    const { codeUdi, fasePoliticaId } = req.body;

    const nuevaEscuela = await Escuela.create({
      codeUdi,
      fasePoliticaId
    });

    return res.status(201).json(nuevaEscuela);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear escuela',
      error: error.message
    });
  }
};


export const updateEscuela = async (req, res) => {
  try {
    const { id } = req.params;
    const { codeUdi, fasePoliticaId } = req.body;

    const escuela = await Escuela.findByPk(id);

    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }

    await escuela.update({
      codeUdi,
      fasePoliticaId
    });

    return res.status(200).json(escuela);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al actualizar escuela',
      error: error.message
    });
  }
};


export const deleteEscuela = async (req, res) => {
  try {
    const { id } = req.params;

    const escuela = await Escuela.findByPk(id);

    if (!escuela) {
      return res.status(404).json({ message: 'Escuela no encontrada' });
    }

    await escuela.destroy();

    return res.status(200).json({
      message: 'Escuela eliminada correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al eliminar escuela',
      error: error.message
    });
  }
};
