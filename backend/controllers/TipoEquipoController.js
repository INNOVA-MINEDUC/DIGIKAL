import { Sequelize } from 'sequelize'
import TipoEquipo from '../models/TipoEquipo.js'

export const getTiposEquipo = async (req, res) => {
  try {
    const tipos = await TipoEquipo.findAll({
      attributes: ['id', 'nombre']
    })

    return res.json(tipos)

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener tipos de equipo',
      error: error.message
    })
  }
}



export const crearTipoEquipo = async (req, res) => {
  try {
    const { nombre } = req.body

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' })
    }

    const existe = await TipoEquipo.findOne({ where: { nombre } })

    if (existe) {
      return res.status(400).json({ message: 'Ya existe este tipo' })
    }

    const nuevo = await TipoEquipo.create({ nombre })

    return res.status(201).json(nuevo)

  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}