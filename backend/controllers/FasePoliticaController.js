import FasePolitica from '../models/FasePolitica.js';

//GET FASEPOLITICA

export const getFasePolitica = async (req, res) => {
  try {
    const fases = await FasePolitica.findAll();

    return res.status(200).json(fases);

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener las fases políticas',
      error: error.message
    });
  }
};


//POST FASEPOLITICA


export const createFasePolitica = async (req, res) => {
  try {
    const { id } = req.params;

    const politica = await FasePolitica.findByPk(id);

    if (!politica) {
      return res.status(404).json({ message: 'Política no encontrada' });
    }

    res.json(politica);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar política', error });
  }
}


//GET BY ID FASEPOLITICA

export const getIdFasePolitica = async (req, res) => {
  try {
    const { id } = req.params;

    const politica = await FasePolitica.findByPk(id);

    if (!politica) {
      return res.status(404).json({ message: 'Política no encontrada' });
    }

    res.json(politica);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar política', error });
  }
}


//PUT BY ID FASEPOLITICA

export const updateIdFasePolitica = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const politica = await FasePolitica.findByPk(id);

    if (!politica) {
      return res.status(404).json({ message: 'Política no encontrada' });
    }

    await politica.update({ name });

    res.json(politica);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar política', error });
  }
}



//DELETE BY ID FASEPOLITICA

export const deleteIdFasePolitica = async (req, res) => {
  try {
    const { id } = req.params;

    const politica = await FasePolitica.findByPk(id);

    if (!politica) {
      return res.status(404).json({ message: 'Política no encontrada' });
    }

    await politica.destroy();

    res.json({ message: 'Política eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar política', error });
  }
}
