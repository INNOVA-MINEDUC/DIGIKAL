import { getToken } from '../utils/auth'

const API_URL = 'http://localhost:3000/api'

export async function apiRequest(endpoint, options = {}) {

  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    throw new Error('Error en la petición')
  }

  return response.json()
}