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
import axios from "axios";
import { obtenerUrlFirmada } from '../services/bucketService.js';

import dotenv from 'dotenv'
dotenv.config()

export const getEscuelaByCodigo = async (req, res) => {
  try {

    const CodigoEscuela = String(req.body?.CodigoEscuela ?? '').trim();

    if (!CodigoEscuela) {
      return res.status(400).json({
        message: "CódigoEscuela es requerido"
      });
    }

const escuelaLocal = await Escuela.findOne({
  // El atributo del modelo es `codigoEscuela` (minúscula): MySQL tolera la
  // otra grafía, pero cualquier otro motor revienta con "unknown column".
  where: { codigoEscuela: CodigoEscuela },
  include: [
    {
      model: Departamento,
      as: "departamento",
      attributes: ["id", "nombre"]
    },
    {
      model: Municipio,
      as: "municipio",
      attributes: ["id", "nombre"]
    }
  ]
});

    if (escuelaLocal) {
      return res.status(200).json({
        source: "local",
        data: escuelaLocal
      });
    }

   const query = `
  query Establecimientos($codigo: String) {
    establecimientos(
      filtro: {
        codigoMineduc: $codigo
      }
    ) {
      id
      codigoMineduc
      nombre
      direccion
      telefono
      correoElectronico
      jornada
      nivel

      departamento {
        id
        nombre
      }

      municipio {
        id
        nombre
        departamentoId
      }

      director {
        id
        nombres
        correoElectronico
      }
    }
  }
`;

    // Configuradas en backend/.env (ver .env.example). Sin URL axios.post
    // recibe undefined y revienta con un 500 sin explicación.
    const API_URL = process.env.MDM_GRAPHQL_URL;
    const API_TOKEN = process.env.MDM_PUBLIC_TOKEN;

    if (!API_URL) {
      return res.status(500).json({
        message: "MDM_GRAPHQL_URL no está configurada en el backend"
      });
    }

    const response = await axios.post(
      API_URL,
      {
        query,
        variables: {
          codigo: CodigoEscuela
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "publicToken": API_TOKEN
        },
        timeout: 30000,
        validateStatus: () => true
      }
    );

    if (response.status >= 400) {
      console.error("MDM status", response.status, response.data);
      return res.status(502).json({
        message: `El API del MINEDUC respondió ${response.status}`
      });
    }

    if (response.data?.errors) {
      console.error("GraphQL ERROR:", response.data.errors);
      return res.status(500).json({
        message: "Error en GraphQL",
        error: response.data.errors
      });
    }

    const resultado = response.data?.data?.establecimientos?.[0];

    if (!resultado) {
      return res.status(404).json({
        message: "Escuela no encontrada en ningún sistema"
      });
    }

    const escuelaFormateada = {
      CodigoEscuela: resultado.codigoMineduc,
      nombreEscuela: resultado.nombre,
      direccion: resultado.direccion,
      telefono: resultado.telefono,
      correo: resultado.correoElectronico,
      departamento: resultado.departamento,
      municipio: resultado.municipio,
      director: resultado.director,
    };

    return res.status(200).json({
      source: "graphql",
      data: escuelaFormateada
    });

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Error al buscar escuela",
      error: error.message
    });
  }
};


export const getEscuelByCodigoMineduc = async (req, res) => {

  try {

    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({
        message: "CodigoEscuela es requerido"
      });
    }

    const escuela = await Escuela.findOne({

      where: {
        codigoEscuela: codigo
      },

      include: [

        /* =====================================
           DOTACIONES
        ===================================== */

        {
          model: Dotacion,
          as: "dotaciones",

          include: [

            /* =================================
               INTERNET
            ================================= */

            {
              model: Internet,
              as: "internet"
            },

            /* =================================
               EQUIPOS
            ================================= */

            {
              model: Equipo,
              as: "equipos",

              through: {
                attributes: []
              },

              include: [

                {
                  model: ModeloEquipo,
                  as: "modelo",

                  include: [

                    {
                      model: TipoEquipo,
                      as: "tipo"
                    }

                  ]
                }

              ]
            },

            /* =================================
               IMAGENES
            ================================= */

            {
              model: DotacionImagen,
              as: "imagenes"
            }

          ]
        },

        /* =====================================
           BENEFICIARIOS
        ===================================== */

        {
          model: Beneficiario,
          as: "beneficiarios"
        }

      ]
    });

    if (!escuela) {

      return res.status(404).json({
        message: "Escuela no encontrada"
      });

    }

    const escuelaData = escuela.toJSON();

    /* =========================================
       FIRMAR IMAGENES
    ========================================= */

    if (escuelaData.dotaciones?.length > 0) {

      escuelaData.dotaciones = await Promise.all(

        escuelaData.dotaciones.map(async (dotacion) => {

          if (dotacion.imagenes?.length > 0) {

            dotacion.imagenes = await Promise.all(

              dotacion.imagenes.map(async (img) => {

                const signed = await obtenerUrlFirmada(img.url);

                return {
                  ...img,
                  signedUrl: signed
                };

              })

            );

          }

          return dotacion;

        })

      );

    }

    return res.status(200).json({
      source: "local",
      data: escuelaData
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error al obtener la escuela",
      error: error.message
    });

  }

};


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
