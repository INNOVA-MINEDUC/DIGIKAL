import { Sequelize, Op } from 'sequelize'
import Equipo from '../models/Equipo.js'
import ModeloEquipo from '../models/ModeloEquipo.js'
import TipoEquipo from '../models/TipoEquipo.js'
import { logAction } from '../services/auditService.js'
import { errorServidor } from '../utils/http.js';


export const crearEquipo = async (req, res) => {
  try {
    const { modelo_id, numero_serie, codigo_sicoin, valor } = req.body


   
    if (!modelo_id || !numero_serie || !codigo_sicoin) {
      return res.status(400).json({
        message: 'modelo_id, numero_serie y codigo_sicoin son obligatorios'
      })
    }


    const existe = await Equipo.findOne({
      where: {
        [Op.or]: [
          { numero_serie },
          { codigo_sicoin }
        ]
      }
    })



    if (existe) {
      return res.status(400).json({
        message: 'El número de serie o código SICOIN ya existe'
      })
    }


    const nuevoEquipo = await Equipo.create({
      modelo_id,
      numero_serie,
      codigo_sicoin,
      valor
    })

    await logAction(req, {
      action: 'EQUIPO_CREATED',
      module: 'EQUIPOS',
      resourceId: nuevoEquipo.id,
      description: `Registró el equipo con serie ${numero_serie} (SICOIN ${codigo_sicoin})`,
    })

    return res.status(201).json({
      message: 'Equipo creado correctamente',
      data: nuevoEquipo
    })

  } catch (error) {
    return errorServidor(res, '[Equipos]', error, "Error al crear equipo")
  }
}

export const getEquipos = async (req, res) => {
  try {

    const modelos = await ModeloEquipo.findAll({
      attributes: [
        'id',
        'nombre_modelo',
        'descripcion_tecnica'
      ],

      include: [
        {
          model: TipoEquipo,
          as: 'tipo',
          attributes: ['nombre']
        },
        {
          model: Equipo,
          as: 'equipos',
          attributes: [], // 👈 no traemos columnas, solo agregados
          required: false // 🔥 ESTO ES LA CLAVE (LEFT JOIN)
        }
      ],

      // 🔥 AGREGADOS
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('equipos.id')), 'cantidad'],
          [Sequelize.fn('SUM', Sequelize.col('equipos.valor')), 'valor_total']
        ]
      },

      group: [
        'ModeloEquipo.id',
        'tipo.id'
      ]
    })

    // 🔥 FORMATEAR RESPUESTA
    const resultado = modelos.map(m => ({
      id: m.id,
      descripcion: m.descripcion_tecnica,
      tipo: m.tipo?.nombre,
      modelo: m.nombre_modelo,
      cantidad: parseInt(m.dataValues.cantidad) || 0,
      valor: parseFloat(m.dataValues.valor_total) || 0
    }))

    return res.status(200).json(resultado)

  } catch (error) {
    return errorServidor(res, '[Equipos]', error, "Error al obtener los equipos")
  }
}


export const getEquiposPorModelo = async (req, res) => {
  try {
    const { id } = req.params

    const equipos = await Equipo.findAll({
      where: { modelo_id: id },
      attributes: ['id', 'numero_serie', 'codigo_sicoin', 'valor']
    })

    return res.status(200).json(equipos)

  } catch (error) {
    return errorServidor(res, '[Equipos]', error, "Error al obtener equipos por modelo")
  }
}


export const crearCategoriaEquipo = async (req, res) => {
  const { tipo, modelo, descripcion } = req.body

  try {

    if (!tipo || !modelo) {
      return res.status(400).json({
        message: 'Tipo y modelo son obligatorios'
      })
    }

    let tipoEquipo = await TipoEquipo.findOne({
      where: { nombre: tipo }
    })

    if (!tipoEquipo) {
      tipoEquipo = await TipoEquipo.create({
        nombre: tipo
      })
    }

    const modeloExistente = await ModeloEquipo.findOne({
      where: {
        nombre_modelo: modelo,
        tipo_id: tipoEquipo.id
      }
    })

    if (modeloExistente) {
      return res.status(400).json({
        message: 'Este modelo ya existe para ese tipo'
      })
    }

    const nuevoModelo = await ModeloEquipo.create({
      nombre_modelo: modelo,
      descripcion_tecnica: descripcion,
      tipo_id: tipoEquipo.id
    })

    await logAction(req, {
      action: 'EQUIPO_CATEGORIA_CREATED',
      module: 'EQUIPOS',
      resourceId: nuevoModelo.id,
      description: `Creó la categoría/modelo "${modelo}" de tipo "${tipo}"`,
    })

    return res.status(201).json({
      message: 'Categoría creada correctamente',
    })

  } catch (error) {
    return errorServidor(res, '[Equipos]', error, "Error al crear categoría")
  }
}



// export const createFasePolitica = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const politica = await FasePolitica.findByPk(id);

//     if (!politica) {
//       return res.status(404).json({ message: 'Política no encontrada' });
//     }

//     res.json(politica);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al buscar política', error });
//   }
// }




// export const getIdFasePolitica = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const politica = await FasePolitica.findByPk(id);

//     if (!politica) {
//       return res.status(404).json({ message: 'Política no encontrada' });
//     }

//     res.json(politica);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al buscar política', error });
//   }
// }




// export const updateIdFasePolitica = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name } = req.body;

//     const politica = await FasePolitica.findByPk(id);

//     if (!politica) {
//       return res.status(404).json({ message: 'Política no encontrada' });
//     }

//     await politica.update({ name });

//     res.json(politica);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al actualizar política', error });
//   }
// }





// export const deleteIdFasePolitica = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const politica = await FasePolitica.findByPk(id);

//     if (!politica) {
//       return res.status(404).json({ message: 'Política no encontrada' });
//     }

//     await politica.destroy();

//     res.json({ message: 'Política eliminada correctamente' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al eliminar política', error });
//   }
// }
