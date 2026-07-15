import { defineStore } from 'pinia'

export const useEstablecimientosStore = defineStore('establecimientos', {

  state: () => ({

    /* =========================================
       DATA GENERAL
    ========================================= */
    establecimientos: [],

    totalEstablecimientos: 0,
    totalEstudiantes: 0,
    totalHombres: 0,
    totalMujeres: 0,
    totalEquipos: 0,
    totalInternet: 0,

    // Dotación de equipos (viene de la BD local, no del API MDM)
    establecimientosDotados: 0,
    estudiantesDotados: 0,
    modelosEquipos: [],

    loading: false,

    /* =========================================
       BENEFICIARIOS
    ========================================= */
    beneficiarios: [],

    /* =========================================
       ETNIAS
    ========================================= */
    totalMayas: 0,
    totalXincas: 0,
    totalGarifunas: 0,
    totalOtros: 0,

    /* =========================================
       EDADES
    ========================================= */
    totalEdad013: 0,
    totalEdad1330: 0,
    totalEdad3060: 0,
    totalEdadMas60: 0

  }),

  getters: {

    getAll: (state) => state.establecimientos,

    getBeneficiarios: (state) => state.beneficiarios,

    getTotalEstablecimientos: (state) =>
      state.totalEstablecimientos,

    getTotalEstudiantes: (state) =>
      state.totalEstudiantes,

    getTotalEquipos: (state) =>
      state.totalEquipos,

    getTotalInternet: (state) =>
      state.totalInternet,

    /* =========================================
       ETNIAS
    ========================================= */
    getEtnias: (state) => [
      {
        type: 'Mayas',
        percent: state.totalMayas
      },
      {
        type: 'Xincas',
        percent: state.totalXincas
      },
      {
        type: 'Garifunas',
        percent: state.totalGarifunas
      },
      {
        type: 'Otros',
        percent: state.totalOtros
      }
    ],

    /* =========================================
       EDADES
    ========================================= */
    getEdades: (state) => [
      {
        month: '0-13',
        value: state.totalEdad013
      },
      {
        month: '13-30',
        value: state.totalEdad1330
      },
      {
        month: '30-60',
        value: state.totalEdad3060
      },
      {
        month: '60+',
        value: state.totalEdadMas60
      }
    ]

  },

  actions: {

    setData(data) {
      this.establecimientos      = data.escuelas || []
      this.totalEstablecimientos = data.establecimientos || 0
      this.totalEstudiantes      = data.totalEstudiantes  || 0
      this.totalHombres          = data.totalHombres      || 0
      this.totalMujeres          = data.totalMujeres      || 0
      this.totalEquipos          = data.totalEquipos      || 0
      this.totalInternet         = data.totalInternet     || 0

      this.establecimientosDotados = data.establecimientosDotados || 0
      this.estudiantesDotados      = data.estudiantesDotados      || 0
      this.modelosEquipos          = data.modelosEquipos          || []
    },

    setEstablecimientos(data) {
      this.establecimientos = data
    },

    setLoading(value) {
      this.loading = value
    }

  }

})