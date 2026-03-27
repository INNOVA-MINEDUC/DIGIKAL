export const required = v => !!v || 'Campo obligatorio'

export const numberPositive = v => {
  if (v === null || v === undefined) return 'Campo obligatorio'
  if (isNaN(v)) return 'Debe ser número'
  if (v < 0) return 'No puede ser negativo'
  return true
}

export const numberMin1 = v => {
  if (!v && v !== 0) return 'Campo obligatorio'
  if (v < 1) return 'Debe ser mayor a 0'
  return true
}

export const email = v => {
  if (!v) return 'Campo obligatorio'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(v) || 'Correo inválido'
}

export const phone = v => {
  if (!v) return 'Campo obligatorio'
  const regex = /^[0-9]{8}$/
  return regex.test(v) || 'Teléfono inválido (8 dígitos)'
}

export const onlyLetters = v => {
  if (!v) return 'Campo obligatorio'
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  return regex.test(v) || 'Solo letras'
}

export const codigoUDI = v => {
  if (!v) return 'Campo obligatorio'
  const regex = /^\d{2}-\d{2}-\d{5}-\d{2}$/
  return regex.test(v) || 'Formato: 00-00-00000-00'
}

export const fileRequired = v => {
  if (!v || v.length === 0) return 'Debe subir archivo'
  return true
}