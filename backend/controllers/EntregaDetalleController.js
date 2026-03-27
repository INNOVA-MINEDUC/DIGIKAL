import EntregaDetalle from '../models/EntregaDetalle.js';


export const getEntregas = async (req, res) => {
  try {
    const entregas = await EntregaDetalle.findAll();
    return res.status(200).json(entregas);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener entregas',
      error: error.message
    });
  }
};


export const getEntregaById = async (req, res) => {
  try {
    const { id } = req.params;

    const entrega = await EntregaDetalle.findByPk(id);

    if (!entrega) {
      return res.status(404).json({ message: 'Entrega no encontrada' });
    }

    return res.status(200).json(entrega);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al buscar entrega',
      error: error.message
    });
  }
};


export const createEntrega = async (req, res) => {
  try {
    const { img, detalle, escuelaId } = req.body;

  
    const escuela = await Escuela.findByPk(escuelaId);
    if (!escuela) {
      return res.status(404).json({ message: 'La escuela no existe' });
    }

    const nuevaEntrega = await EntregaDetalle.create({
      img,
      detalle,
      escuelaId
    });

    return res.status(201).json(nuevaEntrega);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear entrega',
      error: error.message
    });
  }
};


export const updateEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { img, detalle, escuelaId } = req.body;

    const entrega = await EntregaDetalle.findByPk(id);

    if (!entrega) {
      return res.status(404).json({ message: 'Entrega no encontrada' });
    }

 
    if (escuelaId) {
      const escuela = await Escuela.findByPk(escuelaId);
      if (!escuela) {
        return res.status(404).json({ message: 'La escuela no existe' });
      }
    }

    await entrega.update({
      img,
      detalle,
      escuelaId
    });

    return res.status(200).json(entrega);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al actualizar entrega',
      error: error.message
    });
  }
};


export const deleteEntrega = async (req, res) => {
  try {
    const { id } = req.params;

    const entrega = await EntregaDetalle.findByPk(id);

    if (!entrega) {
      return res.status(404).json({ message: 'Entrega no encontrada' });
    }

    await entrega.destroy();

    return res.status(200).json({
      message: 'Entrega eliminada correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al eliminar entrega',
      error: error.message
    });
  }
};
