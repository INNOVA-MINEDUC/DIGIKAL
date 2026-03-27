import Escuela from '../models/Escuela.js';
import Departamento from '../models/Departamento.js'
import Municipio from '../models/Municipio.js'
import {
  obtenerEstablecimientos
} from "../services/apiClient.js"




export const getEscuelasDotadas = async (req, res) => {
  try {
    const { dept, muni } = req.body;

    let where = {}

    if (dept) {
      where['$departamento.nombre$'] = dept.toLowerCase()
    }

    if (muni) {
      where['$municipio.nombre$'] = muni.toLowerCase()
    }

    const escuelas = await Escuela.findAll({
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
        }
      ],
      where,
      attributes: [
        'id',
        'nombreEscuela',
        'codigoEscuela',
        'cantidadEstudiantesBeneficiados',
        'cantidadEquipoEntregado'
      ]
    });

    const totalEstudiantes = escuelas.reduce(
      (acc, escuela) => {
        const valor = Number(escuela.cantidadEstudiantesBeneficiados || 0)
        return acc + valor
      },
      0
    )

    const totalEquipos = escuelas.reduce(
      (acc, escuela) => {
        const valor = Number(escuela.cantidadEquipoEntregado || 0)
        return acc + valor
      },
      0
    )
    

    const totalEstablecimientos = escuelas.length

    return res.status(200).json({
      establecimientos: totalEstablecimientos,
      totalEstudiantes,
      totalEquipos,
      escuelas
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Error al obtener las escuelas',
      error: error.message
    });
  }
};


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
