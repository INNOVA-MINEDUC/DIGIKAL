import { defineStore } from 'pinia'

export const useEstablecimientosStore = defineStore('establecimientos', {
  
  state: () => ({
    establecimientos: [],
    loading: false
  }),

  getters: {
    getAll: (state) => state.establecimientos
  },

  actions: {

    setEstablecimientos(data) {
      this.establecimientos = data
    },

    setLoading(value) {
      this.loading = value
    }

  }
})