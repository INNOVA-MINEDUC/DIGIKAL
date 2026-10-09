<template>
  <!-- Reproductor de Video.js 10 (@videojs/html) con su skin por defecto, en
       español. La documentación del paquete está en
       node_modules/@videojs/html/docs/ (ver guides/vue.md). -->
  <div class="video-informativo">
    <media-i18n lang="es">
      <video-player ref="reproductor">
        <video-skin class="video-informativo__skin">
          <!-- `preload="metadata"`: estos MP4 pesan cientos de MB y con
               "auto" el navegador empezaría a bajarlos al cargar la página.
               Con "metadata" sólo pide el índice del archivo, que en estos
               videos está al inicio y ocupa unos 170 KB. -->
          <video
            :src="src"
            :aria-label="titulo"
            preload="metadata"
            playsinline
          ></video>
        </video-skin>
      </video-player>
    </media-i18n>

    <!-- Botón grande de reproducir en el centro. El skin por defecto de
         Video.js no trae uno (sólo el skin "compat", que es el de controles
         básicos), así que se superpone éste y se maneja con el `store` del
         reproductor, que es la API documentada para leer su estado.

         Va FUERA del skin y por encima de él: el contenedor del skin crea su
         propio contexto de apilamiento (`isolation: isolate`), de modo que
         cualquier z-index positivo aquí queda sobre todo el reproductor,
         diálogo de error incluido. Por eso sólo se muestra en pausa y sin
         error: con el video corriendo estorbaría, y con un error taparía el
         aviso que el propio skin muestra. -->
    <button
      v-if="mostrarBotonCentral"
      type="button"
      class="video-informativo__play"
      :aria-label="`Reproducir: ${titulo}`"
      @click="reproducir"
    >
      <v-icon size="46" color="#fff">mdi-play</v-icon>
    </button>
  </div>
</template>

<script>
/* Reproductores montados, compartidos por TODAS las instancias: al empezar a
   reproducir uno se pausan los demás, porque dos videos con sonido a la vez
   molestan más de lo que ayudan. Va en un <script> normal y no dentro de
   <script setup>, que se ejecuta una vez por cada instancia: este conjunto
   tiene que ser uno solo para todas. */
const reproductores = new Set()
</script>

<script setup>
import '@videojs/html/i18n'
import '@videojs/html/video/player'
import '@videojs/html/video/skin'
import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'

defineProps({
  /** Ruta del video, ya codificada para URL. */
  src: { type: String, required: true },
  /** Nombre accesible del video (lectores de pantalla y botón central). */
  titulo: { type: String, required: true },
})

const reproductor = ref(null)
const estado = reactive({ paused: true, error: null })

const mostrarBotonCentral = computed(() => estado.paused && !estado.error)

let elemento = null
let desuscribir = () => {}

onMounted(() => {
  // Los elementos se registran con los import estáticos de arriba, así que al
  // montar el componente <video-player> ya está definido y expone su store.
  elemento = reproductor.value
  const { store } = elemento

  /* subscribe() avisa de CUALQUIER cambio del store, incluido el avance del
     tiempo varias veces por segundo. Sólo se toca el estado de Vue cuando
     cambia algo que la plantilla usa, y sólo se pausa a los demás en el
     instante en que éste pasa de pausa a reproducción. */
  const sincronizar = () => {
    const { paused, error } = store
    if (paused === estado.paused && error === estado.error) return

    const empezoAReproducir = estado.paused && !paused
    estado.paused = paused
    estado.error = error

    if (empezoAReproducir) {
      for (const otro of reproductores) {
        if (otro !== elemento) otro.store.pause()
      }
    }
  }

  sincronizar()
  desuscribir = store.subscribe(sincronizar)
  reproductores.add(elemento)
})

onUnmounted(() => {
  desuscribir()
  reproductores.delete(elemento)
})

/* play() devuelve una promesa que se rechaza si el archivo no se puede
   reproducir. Ese caso ya lo comunica el diálogo de error del skin; aquí sólo
   se evita el "Uncaught (in promise)" en la consola. */
const reproducir = () => {
  reproductor.value?.store.play().catch(() => {})
}
</script>

<style scoped>
.video-informativo {
  position: relative;
}

/* Las propiedades --media-* son las que el skin empaquetado documenta como
   personalizables (docs/guides/customize-skins.md). */
.video-informativo__skin {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  --media-accent-color: #0094d3;
  --media-accent-text-color: #fff;
  --media-border-radius: 10px;
  --media-font-family: Roboto, sans-serif;
  /* `contain` y no el `cover` por defecto: si algún día se cambia un video
     por otro que no sea 16:9, se ve completo en vez de recortado. */
  --media-object-fit: contain;
  --media-object-position: center;
}

/* Hasta que el navegador registra el elemento, el skin no tiene interfaz: se
   oculta para no mostrar un instante el <video> sin estilo. El hueco 16:9 se
   mantiene, así que la página no salta. */
video-skin:not(:defined) {
  visibility: hidden;
}

.video-informativo__play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 51, 102, 0.85);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.video-informativo__play:hover {
  background: #0094d3;
  transform: translate(-50%, -50%) scale(1.06);
}

.video-informativo__play:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .video-informativo__play {
    width: 64px;
    height: 64px;
  }
}
</style>
