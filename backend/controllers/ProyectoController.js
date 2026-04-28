import Proyecto from '../models/Proyecto.js'

export const obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.findAll()
    res.status(200).json(proyectos)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener los proyectos'
    })
  }
}


export const crearProyecto = async (req, res) => {
  try {
    const { nombre, description } = req.body

    if (!nombre || !description) {
      return res.status(400).json({
        message: 'Nombre y descripción son obligatorios'
      })
    }

    const nuevoProyecto = await Proyecto.create({
      nombre,
      description
    })

    res.status(201).json({
      message: 'Proyecto creado correctamente',
      data: nuevoProyecto
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al crear el proyecto'
    })
  }
}