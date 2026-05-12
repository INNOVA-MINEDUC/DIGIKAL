import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config()

export const subirArchivo = async (filePath) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(process.env.BUCKET_API_URL, form, {
      headers: {
        ...form.getHeaders(),
        'X-API-Key': process.env.BUCKET_API_KEY
      }
    });

    return response.data; 
  } catch (error) {
    console.error('Error subiendo archivo:', error.response?.data || error.message);
    throw new Error('Error al subir archivo');
  }
};



export const obtenerUrlFirmada = async (filename) => {
  try {
    const response = await axios.get(
      `${process.env.BUCKET_API_URL}/${filename}/url`,
      {
        headers: {
          'X-API-Key': process.env.BUCKET_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error obteniendo URL:', error.response?.data || error.message);
    throw new Error('Error al obtener URL');
  }
};



export const eliminarArchivo = async (filename) => {
  try {
    await axios.delete(`${process.env.BUCKET_API_URL}/${filename}`, {
      headers: {
        'X-API-Key': process.env.BUCKET_API_KEY
      }
    });

    return true;
  } catch (error) {
    console.error('Error eliminando archivo:', error.response?.data || error.message);
    throw new Error('Error al eliminar archivo');
  }
};



export const subirMultiples = async (files) => {
  try {
    const form = new FormData();

    files.forEach(file => {
      form.append('files', fs.createReadStream(file.path));
    });

    const response = await axios.post(
      `${process.env.BUCKET_API_URL}/batch`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'X-API-Key': process.env.BUCKET_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error subiendo múltiples:', error.response?.data || error.message);
    throw new Error('Error al subir múltiples archivos');
  }
};