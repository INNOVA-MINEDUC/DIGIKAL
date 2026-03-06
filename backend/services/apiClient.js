import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const queryEstablecimientos = (id) => {
  return `
query {
  establecimientos(filtro: {
  departamentoId: ${id}
  }) {
    id
    nombre
    codigoMineduc

    municipio {
      id
      nombre
    }

    departamento {
      id
      nombre
    }
  }
}
`;
}



const queryDepartamentos = `
query {
  departamentos{
    id,
    nombre
  }
}
`;

const queryMunicipios = `
query {
  municipios{
    id,
    nombre
  }
}
`;

// let authToken = null;

// export const setAuthToken = (token) => {
//   authToken = token;
// };

// const apiClient = axios.create({
//   baseURL: "https://api-mdm-dev.mineduc.edu.gt/graphql",
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

// // interceptor automático
// apiClient.interceptors.request.use((config) => {

//   if (authToken) {
//     config.headers.Authorization = `Bearer ${authToken}`;
//   }

//   return config;
// });

// export default apiClient;

/*const query = `
query {
  establecimientos(filtro: {}) {
    id
    nombre
    codigoMineduc

    municipio {
      id
      nombre
    }

    departamento {
      id
      nombre
    }
  }
}
`;
*/

const obtenerEstablecimientos = async (id) => {
  try {

console.log(id)

    const response = await axios.post(
      process.env.API,
      { query: queryEstablecimientos(id) },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TOKEN}`
        },
      }
    );

    
    // console.log(response.data)
    return response.data

  } catch (error) {
    console.error("Error al consultar establecimientos:", error.message);

    res.status(500).json({
      error: "Error al obtener establecimientos",
      detalle: error.message,
    });
  }
};




const obtenerEstudiantes = async (req, res) => {
  try {
    const query = `
query Estudiantes {

    estudiantes {
        apellidos
        codigo
        comunidadLinguisticaId
        creadoPorId
        cui
        editadoPorId
        establecimientoActualId
        fechaCreacion
        fechaEdicion
        fechaNacimiento
        id
        nombres
        propietarioId
        sexo
    }
}
`;


    const response = await axios.post(
      process.env.API,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TOKEN}`
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Error al consultar establecimientos:", error.message);

    res.status(500).json({
      error: "Error al obtener establecimientos",
      detalle: error.message,
    });
  }
};

export {
  obtenerEstudiantes,
  obtenerEstablecimientos
};

