import Escuela from '../models/Escuela.js';
import {
  obtenerEstablecimientos
} from "../services/apiClient.js"

/**
 * 📌 GET ALL ESCUELAS
 */
export const getEscuelasDotadas = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await obtenerEstablecimientos(id)
    return res.status(200).json(response.data)

    const escuelas = await Escuela.findAll();
    return res.status(200).json(escuelas);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener las escuelas',
      error: error.message
    });
  }
};

/**
 * 📌 GET ESCUELA BY ID
 */
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

/**
 * 📌 CREATE ESCUELA
 */
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

/**
 * 📌 UPDATE ESCUELA
 */
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

/**
 * 📌 DELETE ESCUELA
 */
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
