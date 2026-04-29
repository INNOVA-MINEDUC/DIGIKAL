import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:3000/api/v1';

// Creamos una instancia para no repetir la URL base ni el Content-Type
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  // Configuramos los headers dinámicos
  const config = {
    url: endpoint,
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await api(config);
    
    // Axios guarda la respuesta del servidor en la propiedad 'data'
    return response.data; 
  } catch (error) {
    // Axios lanza un error automáticamente si el status no es 2xx
    const message = error.response?.data?.message || 'Error en la petición';
    throw new Error(message);
  }
}