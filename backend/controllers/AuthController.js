import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const GRAPHQL_ENDPOINT = process.env.API;

export const AuthLogin = async (req, res) => {
  try {

    const { correoElectronico, clave } = req.body;

    const mutation = `
      mutation IniciarSesion($correo: String!, $clave: String!) {
        iniciarSesion(
          clave: $clave
          correoElectronico: $correo
          sistemaClave: "ASISTO"
        ) {
          token
        }
      }
    `;

    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: mutation,
        variables: {
          correo: correoElectronico,
          clave: clave
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // // Manejo errores GraphQL
    // if (response.errors) {
    //   return res.status(401).json({
    //     error: response.errors[0].message
    //   });
    // }

    const token = response.data.data.iniciarSesion.token;

    console.log(token)

    res.json({
      success: true,
      token
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Error al iniciar sesión"
    });

  }
};
