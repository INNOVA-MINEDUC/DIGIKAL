import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

/**
 * Estado de la sesión: única fuente de verdad para el nav y las guardas de ruta.
 *
 * Antes cada componente llamaba a `isAuthenticated()`, que sólo comprobaba que
 * hubiera una cadena en localStorage. Tres problemas que se sumaban:
 *
 *   1. Un token caducado seguía contando como sesión válida: nunca se miraba
 *      el campo `exp`.
 *   2. `computed(() => isAuthenticated())` no era reactivo, porque localStorage
 *      no es una fuente reactiva de Vue. Aunque se borrara el token, el menú
 *      seguía mostrando las vistas de usuario logueado hasta recargar la página.
 *   3. El backend puede invalidar un token ANTES de que expire (subiendo
 *      `tokenVersion` al cerrar sesión, cambiar la contraseña o desactivar la
 *      cuenta) y el navegador no se enteraba.
 *
 * Aquí el token vive en un `ref` de Pinia, así que cualquier cambio repinta el
 * nav al instante; se comprueba `exp`; hay un temporizador que cierra la sesión
 * en el momento exacto de la caducidad; y `api.js` avisa a este store cuando el
 * backend responde 401, que es lo que cubre el caso de la revocación.
 */

const CLAVE = 'token'

// Margen de seguridad: un token al que le quedan segundos se trata como
// caducado, para no lanzar peticiones que van a fallar por el camino.
const MARGEN_MS = 5000

const decodificar = (token) => {
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null   // cadena corrupta o manipulada
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem(CLAVE)
    return {
      token,
      payload: decodificar(token),
      /** id del setTimeout que cierra la sesión al caducar */
      temporizador: null,
      /**
       * Por qué se cerró la última sesión: 'manual', 'caducado' o 'revocado'.
       * Se declara aquí porque en Pinia una propiedad que no esté en el state
       * inicial no es reactiva.
       */
      motivoCierre: null,
    }
  },

  getters: {
    /** Momento de caducidad en ms, o null si el token no lo declara. */
    caducaEn: (s) => (s.payload?.exp ? s.payload.exp * 1000 : null),

    /**
     * Sesión utilizable: hay token, se pudo decodificar y no ha caducado.
     * Es lo que debe gobernar la visibilidad del menú.
     */
    autenticado: (s) => {
      if (!s.token || !s.payload) return false
      if (!s.payload.exp) return false          // sin exp no se puede confiar
      return s.payload.exp * 1000 - MARGEN_MS > Date.now()
    },

    usuario: (s) => (s.payload ? {
      id: s.payload.id,
      name: s.payload.name,
      email: s.payload.email,
      role: s.payload.role,
      roleId: s.payload.roleId,
    } : null),

    rol: (s) => s.payload?.role ?? null,
  },

  actions: {
    /** Tras un login correcto. */
    iniciarSesion(token) {
      localStorage.setItem(CLAVE, token)
      this.token = token
      this.payload = decodificar(token)
      this.programarCaducidad()
    },

    /**
     * Cierra la sesión en el navegador. `motivo` sólo sirve para poder
     * distinguir después una salida voluntaria de una expulsión.
     */
    cerrarSesion(motivo = 'manual') {
      this.cancelarTemporizador()
      localStorage.removeItem(CLAVE)
      this.token = null
      this.payload = null
      this.motivoCierre = motivo
    },

    /**
     * Programa el cierre automático para el instante de la caducidad. Sin esto
     * alguien con la pestaña abierta seguiría viendo el menú completo después
     * de que su token dejara de servir.
     */
    programarCaducidad() {
      this.cancelarTemporizador()
      if (!this.caducaEn) return

      const restante = this.caducaEn - Date.now() - MARGEN_MS
      if (restante <= 0) {
        this.cerrarSesion('caducado')
        return
      }

      // setTimeout se satura por encima de ~24.8 días (límite de int32).
      this.temporizador = setTimeout(
        () => this.cerrarSesion('caducado'),
        Math.min(restante, 2 ** 31 - 1)
      )
    },

    cancelarTemporizador() {
      if (this.temporizador) {
        clearTimeout(this.temporizador)
        this.temporizador = null
      }
    },

    /**
     * Relee localStorage. Lo usa el listener de `storage` para que cerrar
     * sesión en una pestaña se refleje en las demás.
     */
    sincronizar() {
      const token = localStorage.getItem(CLAVE)
      if (token === this.token) return

      this.token = token
      this.payload = decodificar(token)
      this.programarCaducidad()
    },
  },
})
