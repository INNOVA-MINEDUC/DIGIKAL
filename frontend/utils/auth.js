

import { jwtDecode } from "jwt-decode"

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function getUser() {
  const token = getToken()
  if (!token) return null

  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

/**
 * OJO: para la interfaz reactiva úsese el store (src/stores/authStore.js), que
 * es la fuente de verdad. Esta función se conserva para los módulos que aún la
 * importan (services/authService.js).
 *
 * Antes devolvía `!!getToken()`: bastaba con que hubiera CUALQUIER cadena en
 * localStorage —caducada, revocada o corrupta— para darla por buena. Ahora
 * comprueba la caducidad declarada en el propio token.
 */
export function isAuthenticated() {
  const payload = getUser()
  if (!payload?.exp) return false
  return payload.exp * 1000 > Date.now()
}