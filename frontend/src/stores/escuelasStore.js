import { defineStore } from 'pinia'
import api from '@/helpers/api.js'

// Persistimos el filtro y la página en sessionStorage para que sobrevivan al
// navegar al detalle de una escuela y volver, e incluso a un F5. Se usa
// sessionStorage (no localStorage) para que sea por pestaña y no quede pegado
// para siempre.
// La versión (v2) se subió al cambiar el valor por defecto de `intervenida`:
// así se ignora cualquier filtro guardado con el default anterior y el arranque
// respeta el nuevo (traer TODOS los establecimientos desde el inicio).
const PERSIST_KEY = 'digikal.dashboard.filtro.v2'

const FILTRO_DEFECTO = {
  dept: null,
  muni: null,
  // Arranca apagado: por defecto se traen TODOS los establecimientos, no sólo
  // los intervenidos. El usuario puede encender el switch para filtrarlos.
  intervenida: false,
  dotado: false,
  conectividad: false,
  codigoMineduc: '',
  busqueda: '',
}

const cargarPersistido = () => {
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const persistido = cargarPersistido()

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

    // Distribución de establecimientos por nivel educativo
    nivelesDistribucion: [],

    /* =========================================
       PAGINACIÓN (server-side)
    ========================================= */
    // La tabla pide una página a la vez; el backend pagina contra el API.
    // Se restauran de sessionStorage si el usuario ya tenía filtros puestos.
    pagina: persistido?.pagina ?? 1,
    tamanoPagina: persistido?.tamanoPagina ?? 10,
    totalPaginas: 1,

    // Filtro activo. `dept`/`muni` los pone el mapa; `intervenida`, `dotado`,
    // `conectividad` y `codigoMineduc` los pone la tabla. Se guarda todo junto
    // para que al cambiar de página (o de un filtro) se vuelva a pedir con el
    // resto intacto, y se restaura de sessionStorage al volver del detalle.
    filtroActual: { ...FILTRO_DEFECTO, ...(persistido?.filtroActual || {}) },

    // Marca si ya se hizo la primera carga: al volver del detalle no se debe
    // resetear el filtro con una carga "todo" desde cero.
    inicializado: false,

    // Clave de la última consulta pedida, para no repetir la misma llamada
    // (evita el doble fetch entre el mapa y la tabla al montar).
    _ultimaConsulta: null,

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
      this.nivelesDistribucion     = data.nivelesDistribucion     || []

      // El servidor es la fuente de verdad de la paginación.
      if (data.paginacion) {
        this.pagina       = data.paginacion.pagina       ?? this.pagina
        this.tamanoPagina = data.paginacion.tamanoPagina ?? this.tamanoPagina
        this.totalPaginas = data.paginacion.totalPaginas ?? 1
      }
    },

    setEstablecimientos(data) {
      this.establecimientos = data
    },

    setLoading(value) {
      this.loading = value
    },

    // Guarda el filtro y la página para restaurarlos al volver del detalle o
    // tras un F5.
    persistirFiltro() {
      try {
        sessionStorage.setItem(PERSIST_KEY, JSON.stringify({
          filtroActual: this.filtroActual,
          pagina: this.pagina,
          tamanoPagina: this.tamanoPagina,
        }))
      } catch {
        // sessionStorage puede no estar disponible (modo privado, etc.): no es crítico.
      }
    },

    /**
     * Carga inicial del dashboard. Sólo pide datos la primera vez; al volver del
     * detalle de una escuela, el estado (filtros, página y datos) ya sigue vivo
     * en el store, así que no se vuelve a pedir ni se resetea nada.
     */
    async iniciar() {
      if (this.inicializado) return
      await this.fetchDashboard(
        { ...this.filtroActual, pagina: this.pagina, tamanoPagina: this.tamanoPagina },
        { force: true }
      )
    },

    /**
     * Pide una página del dashboard al backend (paginación server-side).
     *
     * Los cambios que se pasan se combinan sobre el filtro actual, así que cada
     * quien toca sólo lo suyo sin borrar el resto:
     *   - el mapa manda { dept, muni, pagina: 1 } al elegir ubicación;
     *   - la tabla manda { dotado, conectividad, codigoMineduc, pagina: 1 } al
     *     cambiar un filtro, o { pagina, tamanoPagina } al pasar de página.
     */
    async fetchDashboard(cambios = {}, { force = false } = {}) {
      const { pagina = 1, tamanoPagina = this.tamanoPagina, ...cambiosFiltro } = cambios

      const filtro = { ...this.filtroActual, ...cambiosFiltro }
      const clave = JSON.stringify({ ...filtro, pagina, tamanoPagina })

      // Misma consulta ya cargada: no repetir (evita doble fetch mapa+tabla).
      if (!force && clave === this._ultimaConsulta) return
      this._ultimaConsulta = clave

      this.filtroActual = filtro
      this.pagina = pagina
      this.tamanoPagina = tamanoPagina
      this.persistirFiltro()
      this.setLoading(true)

      try {
        const { data } = await api.post('/api/v1/dashboard', { ...filtro, pagina, tamanoPagina })
        this.setData(data)
        this.inicializado = true
        // La página real la fija el servidor; se re-persiste ya normalizada.
        this.persistirFiltro()
      } catch (error) {
        console.error('Error cargando dashboard:', error)
        // Permite reintentar la misma consulta tras un fallo.
        this._ultimaConsulta = null
      } finally {
        this.setLoading(false)
      }
    }

  }

})