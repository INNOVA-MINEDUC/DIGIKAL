import api from '../src/helpers/api';
import { getToken } from '../utils/auth';

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