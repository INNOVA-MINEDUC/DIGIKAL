// src/utils/auth.js

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

export function isAuthenticated() {
  return !!getToken()
}