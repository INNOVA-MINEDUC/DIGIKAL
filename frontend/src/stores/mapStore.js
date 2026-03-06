import { defineStore } from "pinia"

export const useMapStore = defineStore("mapStore", {
  state: () => ({
    type: "home",
    departamento: null,
    municipio: null
  }),

  actions: {
    setSelection(payload) {
      this.type = payload.type
      this.departamento = payload.departamento
      this.municipio = payload.municipio

      // 👇 AGREGA ESTE CONSOLE
      // console.log("🗺️ STORE ACTUALIZADO:", {
      //   type: this.type,
      //   departamento: this.departamento,
      //   municipio: this.municipio
      // })
    },

    reset() {
      this.type = "home"
      this.departamento = null
      this.municipio = null

      // console.log("🔄 STORE RESETEADO")
    }
  }
})