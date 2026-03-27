import { defineStore } from 'pinia'

export const useEstablecimientosStore = defineStore('establecimientos', {
  
  state: () => ({
    establecimientos: [],
    totalEstablecimientos: 0, 
    totalEstudiantes: 0, 
    totalEquipos: 0,
    loading: false
  }),

  getters: {
    getAll: (state) => state.establecimientos,
    getTotalEstablecimientos: (state) => state.totalEstablecimientos,
    getTotalEstudiantes: (state) => state.totalEstudiantes,
    getTotalEquipos: (state) => state.totalEquipos
  },

  actions: {

  
    setData(data) {
      this.establecimientos = data.escuelas || []
      this.totalEstablecimientos = data.establecimientos || 0
      this.totalEstudiantes = data.totalEstudiantes || 0
      this.totalEquipos = data.totalEquipos || 0
    },

    
    setEstablecimientos(data) {
      this.establecimientos = data
    },

    setLoading(value) {
      this.loading = value
    }

  }
})