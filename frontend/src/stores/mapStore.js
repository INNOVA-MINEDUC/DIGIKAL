import { defineStore } from "pinia"

// La selección del mapa (departamento/municipio) se persiste por pestaña para
// poder restaurar el zoom al volver del detalle de una escuela o tras un F5,
// igual que el filtro de la tabla.
const PERSIST_KEY = "digikal.dashboard.mapa"

const cargarPersistido = () => {
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const persistido = cargarPersistido()

export const useMapStore = defineStore("mapStore", {
  state: () => ({
    type: persistido?.type ?? "home",
    departamento: persistido?.departamento ?? null,
    municipio: persistido?.municipio ?? null
  }),

  actions: {
    setSelection(payload) {
      this.type = payload.type
      this.departamento = payload.departamento
      this.municipio = payload.municipio
      this.guardar()
    },

    reset() {
      this.type = "home"
      this.departamento = null
      this.municipio = null
      this.guardar()
    },

    guardar() {
      try {
        sessionStorage.setItem(PERSIST_KEY, JSON.stringify({
          type: this.type,
          departamento: this.departamento,
          municipio: this.municipio
        }))
      } catch {
        // sessionStorage puede no estar disponible: no es crítico.
      }
    }
  }
})
