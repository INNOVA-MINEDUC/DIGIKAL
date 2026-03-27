import Escuela from '../models/Escuela.js';


export const getEscuelas = async (req, res) => {
  try {
    const escuelas = await Escuela.findAll();
    return res.status(200).json(escuelas);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener las escuelas',
      error: error.message
    });
  }
};


export const getEscuelaByCodigo = async (req, res) => {
  try {
    const { CodigoEscuela } = req.body;

    if (!CodigoEscuela) {
      return res.status(400).json({
        message: 'CódigoEscuela es requerido'
      });
    }

    const escuela = await Escuela.findOne({
      where: { CodigoEscuela }
    });

    console.log("pass throuthg");


    if (!escuela) {
      return res.status(404).json({
        message: 'Escuela no encontrada'
      });
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
    console.log(req.body)
    return res.status(200).json(req.body)


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
