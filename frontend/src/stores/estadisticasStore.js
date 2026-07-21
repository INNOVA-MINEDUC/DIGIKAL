import { defineStore } from 'pinia'
import api from '@/helpers/api.js'

/**
 * Estadísticas de dotación, conectividad y formación.
 *
 * Una sola llamada a /api/v1/estadisticas trae las cuatro vistas ya agregadas
 * por el backend. La store no recalcula totales: si una cifra hay que cambiarla,
 * se cambia en el backend y aquí no se toca nada.
 */
export const useEstadisticasStore = defineStore('estadisticas', {

  state: () => ({
    indicadores: {
      establecimientos: 0,
      equipos: 0,
      beneficiados: 0,
      conectividad: 0,
      formacion: 0,
      proyectores: 0,
      impresoras: 0,
      municipios: 0,
      departamentos: 0,
      promedioEquiposPorCentro: 0,
      promedioBeneficiadosPorCentro: 0,
      porcentajeConectividad: 0,
      porcentajeFormacion: 0,
    },

    porCicloAnio: [],
    porDepartamento: [],
    porAnio: [],

    // opciones para los controles de filtro, las manda el backend
    opciones: { anios: [], ciclos: [], departamentos: [] },

    // filtros activos; null = sin filtrar
    filtros: { anio: null, ciclo: null, departamento: null },

    loading: false,
    error: null,
  }),

  getters: {
    /** Departamento con más establecimientos dotados. */
    departamentoLider: (state) => state.porDepartamento[0] ?? null,

    /** Años presentes en el corte actual, ordenados. */
    aniosActivos: (state) => [...new Set(state.porAnio.map((f) => f.anio))].sort(),

    hayFiltros: (state) =>
      Boolean(state.filtros.anio || state.filtros.ciclo || state.filtros.departamento),
  },

  actions: {
    async cargar() {
      this.loading = true
      this.error = null

      try {
        const params = {}
        if (this.filtros.anio) params.anio = this.filtros.anio
        if (this.filtros.ciclo) params.ciclo = this.filtros.ciclo
        if (this.filtros.departamento) params.departamento = this.filtros.departamento

        const { data } = await api.get('/api/v1/estadisticas', { params })

        this.indicadores    = data.indicadores    ?? this.indicadores
        this.porCicloAnio   = data.porCicloAnio   ?? []
        this.porDepartamento = data.porDepartamento ?? []
        this.porAnio        = data.porAnio        ?? []
        this.opciones       = data.filtros        ?? this.opciones
      } catch (error) {
        console.error('[Estadisticas] Error al cargar:', error)
        this.error = 'No se pudieron cargar las estadísticas.'
      } finally {
        this.loading = false
      }
    },

    /** Cambia un filtro y recarga. `valor` null lo quita. */
    async setFiltro(clave, valor) {
      this.filtros[clave] = valor || null
      await this.cargar()
    },

    async limpiarFiltros() {
      this.filtros = { anio: null, ciclo: null, departamento: null }
      await this.cargar()
    },
  },
})
