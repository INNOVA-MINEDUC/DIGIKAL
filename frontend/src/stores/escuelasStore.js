import { defineStore } from 'pinia'

export const useEstablecimientosStore = defineStore('establecimientos', {

  state: () => ({

    /* =========================================
       DATA GENERAL
    ========================================= */
    establecimientos: [],

    totalEstablecimientos: 0,
    totalEstudiantes: 0,
    totalEquipos: 0,
    totalInternet: 0,

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

      /* =========================================
         DATA PRINCIPAL
      ========================================= */

      this.establecimientos = data.escuelas || []

      this.totalEstablecimientos =
        data.establecimientos || 0

      this.totalEstudiantes =
        data.totalEstudiantes || 0

      this.totalEquipos =
        data.totalEquipos || 0

      this.totalInternet =
        data.totalInternet || 0

      /* =========================================
         BENEFICIARIOS
      ========================================= */

      const beneficiarios = this.establecimientos.flatMap(
        (escuela) => escuela.beneficiarios || []
      )

      this.beneficiarios = beneficiarios

      /* =========================================
         ETNIAS
      ========================================= */

      this.totalMayas = beneficiarios.reduce(
        (acc, b) => acc + Number(b.mayas || 0),
        0
      )

      this.totalXincas = beneficiarios.reduce(
        (acc, b) => acc + Number(b.xincas || 0),
        0
      )

      this.totalGarifunas = beneficiarios.reduce(
        (acc, b) => acc + Number(b.garifunas || 0),
        0
      )

      this.totalOtros = beneficiarios.reduce(
        (acc, b) => acc + Number(b.otros || 0),
        0
      )

      /* =========================================
         EDADES
      ========================================= */

      this.totalEdad013 = beneficiarios.reduce(
        (acc, b) => acc + Number(b.edad_0_13 || 0),
        0
      )

      this.totalEdad1330 = beneficiarios.reduce(
        (acc, b) => acc + Number(b.edad_13_30 || 0),
        0
      )

      this.totalEdad3060 = beneficiarios.reduce(
        (acc, b) => acc + Number(b.edad_30_60 || 0),
        0
      )

      this.totalEdadMas60 = beneficiarios.reduce(
        (acc, b) => acc + Number(b.edad_mas_60 || 0),
        0
      )

    },

    setEstablecimientos(data) {
      this.establecimientos = data
    },

    setLoading(value) {
      this.loading = value
    }

  }

})