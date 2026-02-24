// src/utils/auth.js

import jwt_decode from "jwt-decode"

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
    return jwt_decode(token)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getToken()
}