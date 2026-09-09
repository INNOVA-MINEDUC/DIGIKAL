<template>
  <v-container fluid class="pa-4 pa-sm-6 pa-lg-8 vista-ciudadania">

    <!-- ── Cabecera compacta ────────────────────────────────────────────── -->
    <div class="cabecera mb-4">
      <div class="cabecera__texto">
        <h1 class="text-h5 text-sm-h4 font-weight-bold text-blue-darken-4 mb-1">
          <v-icon size="32" class="mr-1" color="#003366">mdi-tablet</v-icon>
          Ciudadanía Digikal
        </h1>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Tabletas y conectividad para estudiantes de cuarto año y docentes, financiadas por las
          Organizaciones de Padres de Familia (OPF) — Acuerdos Ministeriales 2066-2026 y 2067-2026.
        </p>
      </div>

      <div class="cabecera__acciones">
        <div class="hero-montos">
          <div class="hero-montos__item">
            <span>Tableta</span>
            <strong>Q2,000</strong>
          </div>
          <div class="hero-montos__item">
            <span>Internet · 12 meses</span>
            <strong>Q600</strong>
          </div>
          <div class="hero-montos__item hero-montos__item--total">
            <span>Total por beneficiario</span>
            <strong>Q2,600</strong>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         HERO: búsquedas + tablet 3D
         La tablet es el componente <Tablet3D> (src/components/Tablet3D.vue):
         el motor Three.js original corre nativamente dentro de Vue, montado
         en onMounted() y desmontado en onUnmounted() — ya NO es un
         <iframe src="/tablet3d/index.html">. Sólo demo/, imgs/ y pdfs/
         siguen viviendo como estáticos en public/tablet3d/ (el propio
         componente los referencia con una URL base fija, ver comentario en
         Tablet3D.vue); su panel lateral sigue oculto (display:none, no
         borrado — se puede reactivar). Las dos búsquedas quedan junto a la
         tablet: son la acción más probable de quien llega a esta vista sin
         sesión. -->
    <!-- <v-card rounded="xl" elevation="2" class="hero-card mb-6 overflow-hidden"> -->
      <v-row no-gutters>
        <v-col cols="12" md="4" class="hero-card__texto pa-6 pa-sm-8">

          <!-- Por número de serie -->
          <div class="hero-busqueda">
            <h3 class="text-subtitle-1 font-weight-bold mb-3" style="color:#003366;">
              <v-icon size="20" class="mr-1">mdi-barcode-scan</v-icon>
              Buscar por número de serie
            </h3>

            <!-- Con un resultado en pantalla el campo se bloquea y el botón
                 pasa a "Resetear": deja claro que lo que se ve corresponde a
                 lo que se buscó, y evita que quede un texto a medio cambiar
                 junto a un resultado que ya no le corresponde. -->
            <v-text-field
              v-model="serieBuscada"
              placeholder="Ej. TAB-0045-QTZ"
              variant="outlined" density="comfortable" hide-details
              prepend-inner-icon="mdi-magnify"
              :clearable="!serieBloqueada"
              :readonly="serieBloqueada"
              :loading="buscandoSerie"
              @keyup.enter="serieBloqueada ? resetearSerie() : buscarPorSerie()"
              @click:clear="resultadoSerie = null"
            >
              <template #append>
                <v-btn
                  :color="serieBloqueada ? '#64748b' : '#0094D3'"
                  style="color:#fff;" variant="flat" class="text-none"
                  :loading="buscandoSerie"
                  :prepend-icon="serieBloqueada ? 'mdi-refresh' : undefined"
                  @click="serieBloqueada ? resetearSerie() : buscarPorSerie()"
                >
                  {{ serieBloqueada ? 'Resetear' : 'Buscar' }}
                </v-btn>
              </template>
            </v-text-field>

            <v-expand-transition>
              <div v-if="resultadoSerie" class="mt-4">
                <v-alert
                  v-if="resultadoSerie.pertenece"
                  type="success" variant="tonal" density="comfortable" icon="mdi-check-decagram"
                >
                  <div class="font-weight-bold mb-1">Sí pertenece a Ciudadanía Digikal</div>
                  <div class="text-body-2">
                    <strong>Establecimiento:</strong> {{ resultadoSerie.tablet.nombreEstablecimiento }}<br>
                    <strong>Código:</strong> {{ resultadoSerie.tablet.codigoEstablecimiento }}<br>
                    <strong>Ubicación:</strong>
                    <span class="text-capitalize">{{ resultadoSerie.tablet.departamento }}</span>
                    <span v-if="resultadoSerie.tablet.municipio" class="text-capitalize">
                      , {{ resultadoSerie.tablet.municipio }}
                    </span><br>
                    <strong>Equipo:</strong>
                    {{ [resultadoSerie.tablet.marca, resultadoSerie.tablet.modelo].filter(Boolean).join(' ') || '—' }}
                    ({{ resultadoSerie.tablet.tipoBeneficiario === 'docente' ? 'docente' : 'estudiante' }})
                  </div>
                </v-alert>

                <v-alert v-else type="warning" variant="tonal" density="comfortable" icon="mdi-close-octagon-outline">
                  <div class="font-weight-bold">No pertenece a Ciudadanía Digikal</div>
                  <div class="text-body-2">
                    No hay ninguna tableta con el número de serie
                    «<strong>{{ ultimaSerieBuscada }}</strong>» registrada en este servicio.
                  </div>
                </v-alert>
              </div>
            </v-expand-transition>
          </div>

          <v-divider class="my-6" />

          <!-- Por establecimiento -->
          <div class="hero-busqueda">
            <h3 class="text-subtitle-1 font-weight-bold mb-3" style="color:#003366;">
              <v-icon size="20" class="mr-1">mdi-school-outline</v-icon>
              Buscar por establecimiento
            </h3>

            <v-text-field
              v-model="establecimientoBuscado"
              placeholder="Nombre o código UDI del establecimiento"
              variant="outlined" density="comfortable" hide-details
              prepend-inner-icon="mdi-magnify"
              :clearable="!establecimientoBloqueado"
              :readonly="establecimientoBloqueado"
              :loading="buscandoEstablecimiento"
              @keyup.enter="establecimientoBloqueado ? resetearEstablecimiento() : buscarPorEstablecimiento()"
              @click:clear="resultadosEstablecimiento = null"
            >
              <template #append>
                <v-btn
                  :color="establecimientoBloqueado ? '#64748b' : '#0094D3'"
                  style="color:#fff;" variant="flat" class="text-none"
                  :loading="buscandoEstablecimiento"
                  :prepend-icon="establecimientoBloqueado ? 'mdi-refresh' : undefined"
                  @click="establecimientoBloqueado ? resetearEstablecimiento() : buscarPorEstablecimiento()"
                >
                  {{ establecimientoBloqueado ? 'Resetear' : 'Buscar' }}
                </v-btn>
              </template>
            </v-text-field>

            <v-expand-transition>
              <div v-if="resultadosEstablecimiento" class="mt-4 resultados-establecimiento">
                <v-alert v-if="!resultadosEstablecimiento.length" type="info" variant="tonal" density="compact">
                  Ningún establecimiento coincide con «{{ ultimoEstablecimientoBuscado }}».
                </v-alert>

                <v-card
                  v-for="est in resultadosEstablecimiento" :key="est.codigoEstablecimiento"
                  variant="outlined" rounded="lg" class="mb-3 pa-3"
                >
                  <div class="font-weight-bold" style="color:#0c3b66;">{{ est.nombreEstablecimiento }}</div>
                  <div class="text-caption text-grey-darken-1 mb-2">
                    {{ est.codigoEstablecimiento }} ·
                    <span class="text-capitalize">{{ est.departamento }}</span>
                    <span v-if="est.municipio" class="text-capitalize">, {{ est.municipio }}</span>
                  </div>
                  <div class="conteo-tablets">
                    <div class="conteo-tablets__dato">
                      <strong>{{ est.tabletsEstudiantes }}</strong>
                      <span>{{ est.tabletsEstudiantes === 1 ? 'estudiante' : 'estudiantes' }}</span>
                    </div>
                    <div class="conteo-tablets__dato">
                      <strong>{{ est.tabletsDocentes }}</strong>
                      <span>{{ est.tabletsDocentes === 1 ? 'docente' : 'docentes' }}</span>
                    </div>
                    <div class="conteo-tablets__dato conteo-tablets__dato--total">
                      <strong>{{ est.totalTablets }}</strong>
                      <span>en total</span>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-expand-transition>
          </div>
        </v-col>

        <v-col cols="12" md="8" class="hero-card__tablet">
          <!-- Salir de la aplicación abierta sin tener que acertarle a la
               barrita de la propia pantalla, que en móvil es diminuta. Sólo
               aparece cuando hay algo abierto (<Tablet3D> lo avisa). -->
          <v-btn
            v-if="appAbiertaEnTablet"
            class="tablet3d-cerrar text-none"
            color="#003366" variant="flat" size="small"
            prepend-icon="mdi-close"
            @click="tabletRef?.irAInicio()"
          >
            Cerrar app
          </v-btn>

          <Tablet3D
            ref="tabletRef"
            class="tablet3d-frame"
            @app-abierta="appAbiertaEnTablet = $event"
          />
        </v-col>
      </v-row>
    <!-- </v-card> -->

    <!-- ── KPIs ─────────────────────────────────────────────────────────── -->
    <v-row class="mb-2">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 text-center" rounded="xl" elevation="2">
          <div class="text-h4 font-weight-black" style="color:#003366;">{{ resumen.totalTablets }}</div>
          <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1">Tabletas registradas</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 text-center" rounded="xl" elevation="2">
          <div class="text-h4 font-weight-black" style="color:#0094D3;">{{ resumen.totalEstablecimientos }}</div>
          <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1">Establecimientos con tabletas</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 text-center" rounded="xl" elevation="2">
          <div class="text-h6 font-weight-bold text-truncate" style="color:#1b7a43;">
            {{ resumen.departamentoTop?.departamento || '—' }}
          </div>
          <div class="text-caption text-uppercase font-weight-bold text-grey-darken-1">
            Departamento con más tabletas
            <span v-if="resumen.departamentoTop"> ({{ resumen.departamentoTop.cantidad }})</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Mapa + ranking por departamento ──────────────────────────────── -->
    <v-row class="mb-2">
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="2" class="pa-2 mapa-card">
          <div v-if="cargandoResumen" class="d-flex align-center justify-center" style="height:400px;">
            <v-progress-circular indeterminate color="#003366" />
          </div>
          <!-- `:key` fuerza a reconstruir el mapa cuando cambian los datos: es
               más simple y fiable que intentar que amCharts5 vuelva a evaluar
               sus adapters de color con el nuevo dataset. -->
          <CiudadaniaMap v-else :key="claveMapa" :datos="resumen.porDepartamento" />
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="2" class="pa-4 ranking-card">
          <h3 class="text-subtitle-1 font-weight-bold mb-3" style="color:#003366;">
            <v-icon size="20" class="mr-1">mdi-podium</v-icon>
            Departamentos con más tabletas
          </h3>

          <div v-if="!resumen.porDepartamento.length" class="text-body-2 text-grey py-6 text-center">
            Aún no hay tabletas registradas.
          </div>

          <div v-else class="ranking-lista">
            <div v-for="(d, i) in resumen.porDepartamento" :key="d.departamento" class="ranking-fila">
              <span class="ranking-fila__pos">{{ i + 1 }}</span>
              <span class="ranking-fila__nombre text-capitalize">{{ d.departamento }}</span>
              <div class="ranking-fila__barra-fondo">
                <div
                  class="ranking-fila__barra"
                  :style="{ width: barraAncho(d.cantidad) + '%' }"
                ></div>
              </div>
              <span class="ranking-fila__cantidad">{{ d.cantidad }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ══════════════════════════════════════════════════════════════════
         INFORMACIÓN DEL PROGRAMA
         Contenido oficial tomado de las guías del Ministerio de Educación
         para las OPF (Acuerdos Ministeriales 2066-2026 y 2067-2026). Se
         presenta como referencia de consulta: no es un formulario que
         recopile datos, es la misma guía en formato web.
         ══════════════════════════════════════════════════════════════════ -->
    <v-card rounded="xl" elevation="2" class="mt-4 mb-2">
      <div class="pa-4 pb-2">
        <h2 class="text-subtitle-1 font-weight-bold" style="color:#003366;">
          <v-icon size="20" class="mr-1">mdi-book-open-variant</v-icon>
          Información del programa
        </h2>
        <p class="text-caption text-grey-darken-1 mb-0">
          Guías oficiales para Organizaciones de Padres de Familia (OPF) — Acuerdos Ministeriales 2066-2026 y 2067-2026.
        </p>
      </div>

      <v-expansion-panels variant="accordion" class="panel-info">

        <!-- Especificaciones del dispositivo -->
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title class="font-weight-bold">
            <v-icon size="20" class="mr-2" color="#003366">mdi-tablet-cellphone</v-icon>
            Especificaciones técnicas de la tableta
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row dense>
              <v-col v-for="e in especificacionesTablet" :key="e.titulo" cols="12" sm="6" lg="4">
                <div class="spec-item">
                  <div class="spec-item__letra">{{ e.letra }}</div>
                  <div>
                    <div class="spec-item__titulo">{{ e.titulo }}</div>
                    <div class="spec-item__texto">{{ e.texto }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-alert type="warning" variant="tonal" density="compact" class="mt-3 text-body-2">
              El equipo no puede ser un teléfono celular (smartphone), debe ser totalmente nuevo
              de fábrica —no se aceptan equipos usados, de exhibición o reparados— y su valor no
              debe superar los <strong>Q2,000.00</strong>.
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Especificaciones del internet -->
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title class="font-weight-bold">
            <v-icon size="20" class="mr-2" color="#003366">mdi-sim</v-icon>
            Especificaciones del servicio de internet
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row dense>
              <v-col v-for="e in especificacionesInternet" :key="e.titulo" cols="12" sm="6">
                <div class="spec-item">
                  <v-icon size="18" class="mr-2 mt-1" color="#0094D3">mdi-check-circle-outline</v-icon>
                  <div>
                    <div class="spec-item__titulo">{{ e.titulo }}</div>
                    <div class="spec-item__texto">{{ e.texto }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Lineamientos para OPF -->
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title class="font-weight-bold">
            <v-icon size="20" class="mr-2" color="#003366">mdi-clipboard-text-outline</v-icon>
            Lineamientos para las OPF
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-for="l in lineamientosOpf" :key="l.titulo" class="lineamiento-item">
              <div class="lineamiento-item__titulo">{{ l.titulo }}</div>
              <div class="lineamiento-item__texto" v-html="l.texto"></div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Listas de verificación -->
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title class="font-weight-bold">
            <v-icon size="20" class="mr-2" color="#003366">mdi-clipboard-check-outline</v-icon>
            Lista de verificación antes de comprar
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="text-body-2 text-grey-darken-1 mb-3">
              Antes de aceptar el equipo o el servicio, confirme cada punto con el proveedor:
            </p>
            <div class="verificacion-lista mb-4">
              <div class="verificacion-lista__titulo">Dispositivo (tableta)</div>
              <div v-for="c in verificacionTablet" :key="c" class="verificacion-fila">
                <v-icon size="16" color="#1b7a43">mdi-checkbox-blank-outline</v-icon>
                <span>{{ c }}</span>
              </div>
            </div>
            <div class="verificacion-lista">
              <div class="verificacion-lista__titulo">Servicio de internet</div>
              <div v-for="c in verificacionInternet" :key="c" class="verificacion-fila">
                <v-icon size="16" color="#1b7a43">mdi-checkbox-blank-outline</v-icon>
                <span>{{ c }}</span>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Preguntas frecuentes -->
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title class="font-weight-bold">
            <v-icon size="20" class="mr-2" color="#003366">mdi-help-circle-outline</v-icon>
            Preguntas frecuentes ({{ preguntasFrecuentes.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-expansion-panels variant="accordion" class="panel-faq">
              <v-expansion-panel v-for="(p, i) in preguntasFrecuentes" :key="i" elevation="0">
                <v-expansion-panel-title class="text-body-2 font-weight-medium">
                  {{ p.pregunta }}
                </v-expansion-panel-title>
                <v-expansion-panel-text class="text-body-2">
                  {{ p.respuesta }}
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Sitios de navegación autorizados -->
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title class="font-weight-bold">
            <v-icon size="20" class="mr-2" color="#003366">mdi-web</v-icon>
            Sitios de navegación autorizados ({{ paqueteNavegacion.length }})
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="text-body-2 text-grey-darken-1 mb-3">
              El plan de internet incluido está filtrado para uso educativo: sólo permite
              navegar hacia estos portales y plataformas autorizadas por el Ministerio de Educación.
            </p>
            <v-text-field
              v-model="filtroNavegacion" density="compact" variant="solo-filled" flat hide-details
              clearable prepend-inner-icon="mdi-magnify" placeholder="Buscar sitio (ej. Google, Canva, becas...)"
              class="mb-3"
            />
            <div class="tabla-scroll">
              <v-data-table
                :headers="columnasNavegacion"
                :items="paqueteNavegacion"
                :search="filtroNavegacion"
                item-value="url"
                density="compact"
                :items-per-page="10"
              >
                <template #item.url="{ item }">
                  <a :href="'https://' + item.url" target="_blank" rel="noopener noreferrer" class="enlace-navegacion">
                    {{ item.url }}
                    <v-icon size="12" class="ml-1">mdi-open-in-new</v-icon>
                  </a>
                </template>
              </v-data-table>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

      </v-expansion-panels>
    </v-card>

    <!-- ══════════════════════════════════════════════════════════════════
         SOPORTE Y ORIENTACIÓN — Tabletas y OPF
         Transcrito del material informativo oficial de soporte (DIGIKAL /
         DIGECADE). Igual que el resto del contenido del programa, vive aquí
         como constantes: es texto de referencia fijo, no datos de la API.
         ══════════════════════════════════════════════════════════════════ -->
    <v-card rounded="xl" elevation="2" class="mt-4 mb-2 soporte-opf">
      <div class="soporte-opf__cab">
        <div class="soporte-opf__kicker">Programa de Recursos Educativos Tecnológicos · DIGIKAL / DIGECADE</div>
        <h2 class="soporte-opf__titulo">Soporte y orientación</h2>
        <p class="soporte-opf__subtitulo-cab">Tabletas y Organizaciones de Padres de Familia (OPF)</p>
      </div>

      <div class="pa-4 pa-sm-6">
        <h3 class="soporte-opf__subtitulo">
          <v-icon size="18" class="mr-1" color="#003366">mdi-headset</v-icon>
          Canales de atención
        </h3>

        <v-row class="mb-2">
          <v-col cols="12" sm="6">
            <div class="canal-atencion">
              <v-icon size="30" color="#003366">mdi-phone-classic</v-icon>
              <div>
                <div class="canal-atencion__etiqueta">Canal 1</div>
                <div class="canal-atencion__numero">PBX MINEDUC · 1503</div>
                <v-chip size="small" color="#e8720c" variant="flat" style="color:#fff;" class="mt-1">
                  Opción 3
                </v-chip>
              </div>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <div class="canal-atencion">
              <v-icon size="30" color="#003366">mdi-cellphone</v-icon>
              <div>
                <div class="canal-atencion__etiqueta">Canal 2</div>
                <div class="canal-atencion__numero">Línea directa · 2411-9595</div>
                <div class="canal-atencion__ext">Extensiones: 5100 · 5101 · 5102 · 5103</div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <h3 class="soporte-opf__subtitulo">
          <v-icon size="18" class="mr-1" color="#003366">mdi-comment-question-outline</v-icon>
          Consultas sobre tabletas y OPF
        </h3>

        <div class="consulta-item" v-for="c in consultasOpf" :key="c.titulo">
          <v-icon size="22" color="#0094D3">{{ c.icono }}</v-icon>
          <div>
            <div class="consulta-item__titulo">{{ c.titulo }}</div>
            <div class="consulta-item__texto">{{ c.texto }}</div>
          </div>
        </div>

        <v-divider class="my-4" />

        <v-alert type="info" variant="tonal" density="comfortable" icon="mdi-clipboard-text-outline">
          <div class="font-weight-bold mb-2">Información clave para la orientación</div>
          <ul class="soporte-opf__info-clave">
            <li v-for="dato in infoClaveOpf" :key="dato">{{ dato }}</li>
          </ul>
        </v-alert>

        <p class="soporte-opf__nota">
          Material informativo de apoyo. Verifique siempre los lineamientos y documentos oficiales vigentes.
        </p>
      </div>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import api from '@/helpers/api.js'
import CiudadaniaMap from '@/components/CiudadaniaMap.vue'
import Tablet3D from '@/components/Tablet3D.vue'

/* ── Resumen (KPIs, mapa, ranking) ─────────────────────────────────────── */

const resumen = ref({ totalTablets: 0, totalEstablecimientos: 0, departamentoTop: null, porDepartamento: [] })
const cargandoResumen = ref(false)
const claveMapa = ref(0)

const cargarResumen = async () => {
  cargandoResumen.value = true
  try {
    const { data } = await api.get('/api/v1/ciudadania/resumen')
    resumen.value = data
    claveMapa.value++
  } catch (error) {
    console.error('[Ciudadania] Error al cargar el resumen:', error)
  } finally {
    cargandoResumen.value = false
  }
}

const barraAncho = (cantidad) => {
  const max = resumen.value.porDepartamento[0]?.cantidad || 1
  return Math.max(4, Math.round((cantidad / max) * 100))
}

/* ══════════════════════════════════════════════════════════════════════════
   APLICACIONES QUE SE ABREN DENTRO DE LA TABLET 3D

   Al buscar, <Tablet3D> tumba la tablet, la encuadra hasta llenar su escena y
   abre estas páginas como una aplicación en su pantalla (el motor las inyecta
   con `srcdoc`, así que cada una es un documento independiente y lleva sus
   propios estilos).

   Se diseñan para el panel en horizontal: 1536 x 1080 px CSS, la resolución
   "nativa" de la pantalla del modelo. Por eso los tamaños de letra parecen
   grandes — a la escala a la que se ve la tablet acaban leyéndose como texto
   normal.
   ══════════════════════════════════════════════════════════════════════════ */

const tabletRef = ref(null)

/** ¿Hay una aplicación abierta en la pantalla de la tablet? Lo avisa <Tablet3D>. */
const appAbiertaEnTablet = ref(false)

/** Escapa el HTML de todo lo que viene de la API antes de inyectarlo. */
const escaparHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]))

const ESTILOS_APP_TABLET = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 26px;
    line-height: 1.45;
    color: #0f172a;
    background: #f1f5f9;
    padding-bottom: 96px;   /* deja libre la barrita de inicio de la pantalla */
  }
  .cab {
    background: linear-gradient(120deg, #003366 0%, #0094D3 100%);
    color: #fff;
    padding: 38px 52px 32px;
  }
  .cab__marca { font-size: 20px; letter-spacing: .24em; text-transform: uppercase; opacity: .82; }
  .cab h1 { margin: 8px 0 0; font-size: 46px; line-height: 1.15; }
  .cab p { margin: 10px 0 0; font-size: 24px; opacity: .9; }
  main { padding: 34px 52px 40px; }

  /* --- estado de una consulta por serie --- */
  .estado { display: flex; align-items: center; gap: 26px; padding: 30px 34px; border-radius: 22px; }
  .estado--si { background: #dcfce7; border: 2px solid #86efac; }
  .estado--no { background: #fef3c7; border: 2px solid #fcd34d; }
  .estado__icono {
    flex: none; width: 78px; height: 78px; border-radius: 50%;
    display: grid; place-items: center; font-size: 42px; font-weight: 700; color: #fff;
  }
  .estado--si .estado__icono { background: #16a34a; }
  .estado--no .estado__icono { background: #d97706; }
  .estado__titulo { font-size: 36px; font-weight: 800; }
  .estado--si .estado__titulo { color: #14532d; }
  .estado--no .estado__titulo { color: #78350f; }
  .estado__serie { font-family: ui-monospace, Consolas, monospace; font-size: 26px; margin-top: 4px; opacity: .8; }

  /* --- ficha del establecimiento al que pertenece --- */
  .ficha { margin-top: 34px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px 34px; }
  .campo { background: #fff; border: 2px solid #e2e8f0; border-radius: 18px; padding: 22px 26px; }
  .campo--ancho { grid-column: 1 / -1; }
  .campo span {
    display: block; font-size: 19px; letter-spacing: .12em; text-transform: uppercase;
    color: #64748b; font-weight: 700; margin-bottom: 6px;
  }
  .campo strong { font-size: 28px; font-weight: 700; color: #0f172a; }
  .capital { text-transform: capitalize; }

  /* --- resumen y tabla de establecimientos --- */
  .resumen { display: flex; gap: 20px; margin-bottom: 30px; }
  .resumen__dato {
    background: #fff; border: 2px solid #e2e8f0; border-radius: 18px;
    padding: 20px 30px; min-width: 210px;
  }
  .resumen__dato b { display: block; font-size: 46px; font-weight: 800; color: #003366; line-height: 1.1; }
  .resumen__dato span { font-size: 19px; letter-spacing: .1em; text-transform: uppercase; color: #64748b; font-weight: 700; }

  table { width: 100%; border-collapse: separate; border-spacing: 0; background: #fff;
          border: 2px solid #e2e8f0; border-radius: 18px; overflow: hidden; }
  th {
    text-align: left; font-size: 19px; letter-spacing: .1em; text-transform: uppercase;
    color: #fff; background: #003366; padding: 18px 24px; font-weight: 700;
  }
  td { padding: 22px 24px; border-top: 2px solid #eef2f8; vertical-align: top; font-size: 24px; }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  .nombre-est { font-weight: 700; color: #0c3b66; }
  .codigo { font-family: ui-monospace, Consolas, monospace; font-size: 21px; color: #64748b; margin-top: 4px; }
  .cuenta { font-size: 34px; font-weight: 800; color: #0094D3; }
  .cuenta--docentes { color: #1b7a43; }
  .cuenta--total { color: #003366; }

  /* --- sin resultados --- */
  .vacio { text-align: center; padding: 70px 40px; background: #fff; border: 2px dashed #cbd5e1; border-radius: 24px; }
  .vacio__icono { font-size: 84px; line-height: 1; }
  .vacio__titulo { font-size: 38px; font-weight: 800; color: #003366; margin: 20px 0 12px; }
  .vacio p { margin: 0 auto; max-width: 900px; color: #475569; font-size: 25px; }
  .nota { margin: 30px 0 0; color: #475569; font-size: 24px; }

  /* --- la tablet de pie (pantalla de 810 x 1152) ---
     En teléfonos la tablet se queda vertical, así que la misma página tiene
     que funcionar en una pantalla más estrecha y más alta: la ficha pasa a
     una sola columna y la tabla se aprieta para que quepan sus 4 columnas.
     El corte va en 1000 px para que sólo lo active el panel de pie (810) y
     no el tumbado (1152). */
  @media (max-width: 1000px) {
    main { padding: 30px 40px 40px; }
    .cab { padding: 34px 40px 30px; }
    .cab h1 { font-size: 42px; }
    .ficha { grid-template-columns: 1fr; }
    .resumen__dato { flex: 1; min-width: 0; padding: 20px 24px; }
    .resumen__dato b { font-size: 40px; }
    .resumen__dato span { font-size: 17px; }
    th { padding: 16px 18px; font-size: 18px; }
    td { padding: 18px; font-size: 23px; }
    .cuenta { font-size: 30px; }
  }
`

/** Envoltorio común de las páginas que se abren en la tablet. */
const paginaTablet = ({ titulo, subtitulo, cuerpo }) => `<!DOCTYPE html>
<html lang="es-GT">
<head>
  <meta charset="utf-8" />
  <title>${escaparHtml(titulo)}</title>
  <style>${ESTILOS_APP_TABLET}</style>
</head>
<body>
  <header class="cab">
    <div class="cab__marca">Ciudadanía Digikal</div>
    <h1>${escaparHtml(titulo)}</h1>
    <p>${escaparHtml(subtitulo)}</p>
  </header>
  <main>${cuerpo}</main>
</body>
</html>`

const ubicacionTexto = (departamento, municipio) =>
  [departamento, municipio].filter(Boolean).join(', ') || '—'

/** Resultado de consultar un número de serie: a qué establecimiento pertenece. */
const appResultadoSerie = (serie, resultado) => {
  if (!resultado?.pertenece) {
    return paginaTablet({
      titulo: 'Consulta por número de serie',
      subtitulo: `Serie consultada: ${serie}`,
      cuerpo: `
        <div class="estado estado--no">
          <div class="estado__icono">!</div>
          <div>
            <div class="estado__titulo">No pertenece a Ciudadanía Digikal</div>
            <div class="estado__serie">${escaparHtml(serie)}</div>
          </div>
        </div>
        <p class="nota">
          No hay ninguna tableta con este número de serie registrada en el servicio, así que
          no se le puede asignar ningún establecimiento. Verifique que el número esté completo
          y tal como aparece en la etiqueta del equipo o en su caja.
        </p>`,
    })
  }

  const t = resultado.tablet
  return paginaTablet({
    titulo: 'Consulta por número de serie',
    subtitulo: `Serie consultada: ${serie}`,
    cuerpo: `
      <div class="estado estado--si">
        <div class="estado__icono">&#10003;</div>
        <div>
          <div class="estado__titulo">Sí pertenece a Ciudadanía Digikal</div>
          <div class="estado__serie">${escaparHtml(t.numeroSerie)}</div>
        </div>
      </div>
      <div class="ficha">
        <div class="campo campo--ancho">
          <span>Establecimiento al que pertenece</span>
          <strong>${escaparHtml(t.nombreEstablecimiento)}</strong>
        </div>
        <div class="campo">
          <span>Código del establecimiento</span>
          <strong>${escaparHtml(t.codigoEstablecimiento)}</strong>
        </div>
        <div class="campo">
          <span>Ubicación</span>
          <strong class="capital">${escaparHtml(ubicacionTexto(t.departamento, t.municipio))}</strong>
        </div>
        <div class="campo">
          <span>Equipo</span>
          <strong>${escaparHtml([t.marca, t.modelo].filter(Boolean).join(' ') || 'Sin especificar')}</strong>
        </div>
        <div class="campo">
          <span>Entregada a</span>
          <strong>${t.tipoBeneficiario === 'docente' ? 'Un docente' : 'Un estudiante'}</strong>
        </div>
        <div class="campo">
          <span>Estado</span>
          <strong>${escaparHtml(t.estadoRegistro || 'Sin estado')}</strong>
        </div>
        <div class="campo">
          <span>Registrada el</span>
          <strong>${escaparHtml(formatFecha(t.registradaEn))}</strong>
        </div>
      </div>`,
  })
}

/** Tablets agrupadas por establecimiento, o el aviso de que no hay ninguna. */
const appResultadosEstablecimiento = (consulta, lista) => {
  if (!lista?.length) {
    return paginaTablet({
      titulo: 'Tabletas por establecimiento',
      subtitulo: `Búsqueda: ${consulta}`,
      cuerpo: `
        <div class="vacio">
          <div class="vacio__icono">&#128269;</div>
          <div class="vacio__titulo">No hay establecimientos con tabletas</div>
          <p>
            Ningún establecimiento que coincida con «${escaparHtml(consulta)}» tiene tabletas
            registradas en Ciudadanía Digikal. Pruebe con el código UDI completo o con parte
            del nombre oficial del centro educativo.
          </p>
        </div>`,
    })
  }

  const totalTablets = lista.reduce((suma, est) => suma + (est.totalTablets || 0), 0)
  const totalEstudiantes = lista.reduce((suma, est) => suma + (est.tabletsEstudiantes || 0), 0)
  const totalDocentes = lista.reduce((suma, est) => suma + (est.tabletsDocentes || 0), 0)

  const filas = lista.map((est) => `
    <tr>
      <td>
        <div class="nombre-est">${escaparHtml(est.nombreEstablecimiento)}</div>
        <div class="codigo">${escaparHtml(est.codigoEstablecimiento)}</div>
      </td>
      <td class="capital">${escaparHtml(ubicacionTexto(est.departamento, est.municipio))}</td>
      <td><span class="cuenta">${est.tabletsEstudiantes || 0}</span></td>
      <td><span class="cuenta cuenta--docentes">${est.tabletsDocentes || 0}</span></td>
      <td><span class="cuenta cuenta--total">${est.totalTablets || 0}</span></td>
    </tr>`).join('')

  return paginaTablet({
    titulo: 'Tabletas por establecimiento',
    subtitulo: `Búsqueda: ${consulta}`,
    cuerpo: `
      <div class="resumen">
        <div class="resumen__dato">
          <b>${lista.length}</b>
          <span>${lista.length === 1 ? 'Establecimiento' : 'Establecimientos'}</span>
        </div>
        <div class="resumen__dato">
          <b>${totalEstudiantes}</b>
          <span>${totalEstudiantes === 1 ? 'Estudiante con tableta' : 'Estudiantes con tabletas'}</span>
        </div>
        <div class="resumen__dato">
          <b>${totalDocentes}</b>
          <span>${totalDocentes === 1 ? 'Docente con tableta' : 'Docentes con tabletas'}</span>
        </div>
        <div class="resumen__dato">
          <b>${totalTablets}</b>
          <span>${totalTablets === 1 ? 'Tableta en total' : 'Tabletas en total'}</span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Establecimiento</th>
            <th>Ubicación</th>
            <th>Estudiantes</th>
            <th>Docentes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>`,
  })
}

/* ── Búsqueda por número de serie ──────────────────────────────────────── */

const serieBuscada = ref('')
const ultimaSerieBuscada = ref('')
const resultadoSerie = ref(null)
const buscandoSerie = ref(false)

/* El campo se bloquea sólo cuando la consulta ENCONTRÓ la tablet. Si no
   apareció, lo normal es que haya un dígito mal y hay que poder corregirlo
   sin dar un paso de más. */
const serieBloqueada = computed(() => Boolean(resultadoSerie.value?.pertenece))

const resetearSerie = () => {
  serieBuscada.value = ''
  resultadoSerie.value = null
  ultimaSerieBuscada.value = ''
}

const buscarPorSerie = async () => {
  const serie = serieBuscada.value.trim()
  if (!serie) return

  buscandoSerie.value = true
  ultimaSerieBuscada.value = serie
  try {
    const { data } = await api.get(`/api/v1/ciudadania/tablets/serie/${encodeURIComponent(serie)}`)
    resultadoSerie.value = data
    // El detalle completo se abre dentro de la tablet, que se coloca y se
    // encuadra para mostrarlo (ver Tablet3D.vue → mostrarApp).
    tabletRef.value?.mostrarApp({
      html: appResultadoSerie(serie, data),
      nombre: 'Consulta por serie',
    })
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo realizar la búsqueda', 'error')
  } finally {
    buscandoSerie.value = false
  }
}

/* ── Búsqueda por establecimiento ───────────────────────────────────────── */

const establecimientoBuscado = ref('')
const ultimoEstablecimientoBuscado = ref('')
const resultadosEstablecimiento = ref(null)
const buscandoEstablecimiento = ref(false)

/* Igual que en la búsqueda por serie: sólo se bloquea si hubo resultados. */
const establecimientoBloqueado = computed(() => Boolean(resultadosEstablecimiento.value?.length))

const resetearEstablecimiento = () => {
  establecimientoBuscado.value = ''
  resultadosEstablecimiento.value = null
  ultimoEstablecimientoBuscado.value = ''
}

const buscarPorEstablecimiento = async () => {
  const q = establecimientoBuscado.value.trim()
  if (q.length < 2) {
    return Swal.fire('Muy corto', 'Escriba al menos 2 caracteres para buscar.', 'warning')
  }

  buscandoEstablecimiento.value = true
  ultimoEstablecimientoBuscado.value = q
  try {
    const { data } = await api.get('/api/v1/ciudadania/tablets/buscar', { params: { q } })
    resultadosEstablecimiento.value = data.resultados
    // La tabla (o el aviso de que no hay ninguno) se muestra en la tablet.
    tabletRef.value?.mostrarApp({
      html: appResultadosEstablecimiento(q, data.resultados),
      nombre: 'Tabletas por establecimiento',
    })
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo realizar la búsqueda', 'error')
  } finally {
    buscandoEstablecimiento.value = false
  }
}

const formatFecha = (v) => v ? new Date(v).toLocaleDateString('es-GT') : '—'

/* ── Contenido informativo del programa ──────────────────────────────────
   Transcrito de las guías oficiales del Ministerio de Educación para OPF
   (Acuerdos Ministeriales 2066-2026 y 2067-2026). Es contenido de referencia
   fijo, no datos de la API: por eso vive aquí como constantes y no en el
   backend. */

const especificacionesTablet = [
  { letra: 'A', titulo: 'Pantalla', texto: 'Entre 10 y 11 pulgadas, con resolución mínima de 1920 x 1200 píxeles.' },
  { letra: 'B', titulo: 'Procesador', texto: 'De 8 núcleos o superior.' },
  { letra: 'C', titulo: 'Memoria RAM', texto: 'Mínima de 4 GB.' },
  { letra: 'D', titulo: 'Almacenamiento', texto: 'Mínimo de 64 GB de memoria interna.' },
  { letra: 'E', titulo: 'Conectividad', texto: 'Ranura física para tarjeta inteligente (SIM Card / Chip), obligatoria.' },
  { letra: 'F', titulo: 'Sistema operativo', texto: 'Instalado de fábrica; no se aceptan versiones lanzadas antes de 2023.' },
  { letra: 'G', titulo: 'Accesorios', texto: 'Estuche protector a la medida exacta del dispositivo, con teclado físico integrado.' },
  { letra: 'H', titulo: 'Batería', texto: 'Recargable integrada, con una capacidad mínima de 5,100 mAh.' },
  { letra: 'I', titulo: 'Garantía', texto: 'Mínima de un año.' },
]

const especificacionesInternet = [
  { titulo: 'Pago único', texto: 'El costo total por 12 meses debe ser de hasta Q600. No se permiten contratos con facturación mensual ni recargos posteriores.' },
  { titulo: 'Vigencia', texto: 'El paquete no debe expirar ni cancelarse antes de cumplir los 12 meses.' },
  { titulo: 'SIM física obligatoria', texto: 'El proveedor debe entregar una tarjeta SIM física; no se aceptan formatos virtuales (eSIM).' },
  { titulo: 'Acceso educativo', texto: 'Acceso ilimitado a los portales pedagógicos institucionales y plataformas autorizadas por el MINEDUC.' },
  { titulo: 'Registro obligatorio', texto: 'El servicio debe quedar registrado a nombre del padre, madre o tutor legal si el estudiante es menor de edad.' },
]

const lineamientosOpf = [
  {
    titulo: 'A · Selección de proveedores',
    texto: 'Deben tener capacidad de emitir Factura Electrónica y asegurar la entrega total de los equipos y SIM/chips en una sola entrega.',
  },
  {
    titulo: 'B · Separación de facturación',
    texto: 'La adquisición debe sustentarse con <strong>dos facturas independientes</strong>: una por las tabletas y otra por los 12 meses de conectividad. Pueden ser del mismo proveedor o de proveedores distintos, siempre que los documentos se emitan por separado.',
  },
  {
    titulo: 'C · Protocolo de entrega',
    texto: 'La distribución es exclusivamente dentro del centro educativo, en jornadas programadas por la dirección y la OPF, con asistencia obligatoria del estudiante beneficiario junto con su padre, madre o tutor legal.',
  },
  {
    titulo: 'D · Acta de compromiso',
    texto: 'Para recibir el equipo, el padre, madre o tutor legal debe firmar el Acta de Compromiso Institucional (modelo oficial del MINEDUC), que establece el uso exclusivamente pedagógico de la tableta. El acta firmada la resguarda el centro educativo.',
  },
  {
    titulo: 'E · Registro técnico',
    texto: 'Al concluir la entrega, la dirección y la OPF tienen <strong>una semana</strong> para llenar el formulario digital oficial, indispensable para activar el acceso a las plataformas. Requiere: del equipo (marca, modelo y serie), del estudiante (código y número telefónico asignado) y del tutor (nombre completo y CUI).',
  },
  {
    titulo: 'F · Cuenta institucional',
    texto: 'El dispositivo debe asociarse obligatoriamente a la cuenta institucional del MINEDUC (dominio <strong>@mineduc.edu.gt</strong>); está prohibido sustituirla por cuentas personales o comerciales.',
  },
]

const verificacionTablet = [
  'El valor del equipo no supera los Q2,000.00.',
  'Pantalla de entre 10 y 11 pulgadas, resolución mínima 1920 x 1200 píxeles.',
  'Procesador de 8 núcleos o superior.',
  'Memoria RAM mínima de 4 GB.',
  'Almacenamiento interno mínimo de 64 GB.',
  'Incluye ranura física para tarjeta inteligente (SIM Card / Chip).',
  'Sistema operativo de fábrica, versión de 2023 en adelante.',
  'Incluye estuche protector a la medida exacta del dispositivo.',
  'Incluye teclado físico compatible.',
  'Batería recargable con capacidad mínima de 5,100 mAh.',
  'Incluye garantía mínima de un año.',
  'El equipo y sus accesorios son totalmente nuevos, sin uso previo.',
  'El equipo no es un teléfono celular (smartphone).',
]

const verificacionInternet = [
  'El costo total del servicio por 12 meses no supera los Q600.00.',
  'El servicio no expira ni se cancela antes de cumplir los 12 meses.',
  'El proveedor entrega una tarjeta SIM física (no eSIM).',
  'El proveedor cuenta con buena cobertura en la comunidad.',
  'El servicio está enfocado en la navegación hacia portales educativos oficiales.',
  'El servicio móvil queda registrado a nombre del padre, madre o tutor legal.',
]

const preguntasFrecuentes = [
  {
    pregunta: '¿Podemos comprar las tabletas con un negocio y el internet con otro?',
    respuesta: 'Sí. Se puede comprar cada servicio con un proveedor distinto; el único requisito obligatorio es que emitan dos facturas electrónicas separadas: una por las tabletas y otra por el internet.',
  },
  {
    pregunta: '¿Podemos comprar marcas o modelos diferentes para los alumnos o docentes del mismo centro educativo?',
    respuesta: 'No. Todos los estudiantes o docentes del mismo establecimiento deben tener exactamente la misma marca y modelo de tableta, para garantizar la equidad y facilitar la enseñanza.',
  },
  {
    pregunta: '¿Qué papeles o requisitos debe cumplir el proveedor?',
    respuesta: 'Debe estar legalmente registrado ante la SAT, tener capacidad de dar factura electrónica, entregar todos los equipos y chips según factura, y entregar la garantía por escrito de cada dispositivo.',
  },
  {
    pregunta: '¿Es obligatorio que la tableta cumpla con todas las características de la guía?',
    respuesta: 'Sí, es obligatorio: no puede ser menor a 10 pulgadas, debe tener 8 núcleos, mínimo 4 GB de RAM, 64 GB de almacenamiento, batería grande, estuche rígido y teclado físico. No se permite comprar teléfonos en su lugar.',
  },
  {
    pregunta: '¿Se pueden comprar recargas de saldo mes a mes para los estudiantes o docentes?',
    respuesta: 'No. Está prohibido pagar de forma mensual o adquirir recargas fraccionadas. La OPF debe hacer un pago único de hasta Q600.00 por un plan con vigencia continua de 12 meses.',
  },
  {
    pregunta: '¿Qué empresa de telefonía debemos elegir para el internet?',
    respuesta: 'La que tenga mejor señal y cobertura en la comunidad y la escuela, para que no haya interrupciones en clase. El chip debe ser obligatoriamente físico.',
  },
  {
    pregunta: '¿Las tabletas se quedan en la escuela o se las llevan los estudiantes o docentes?',
    respuesta: 'Se las llevan. Las tabletas pasan a ser propiedad del estudiante o docente; al terminar el año escolar no deben devolverse a la escuela.',
  },
  {
    pregunta: '¿Debemos registrar estas tabletas al inventario de la escuela?',
    respuesta: 'No. Como los dispositivos pasan a ser propiedad del alumno o docente para uso en casa y en clase, no se registran en el libro de inventario del establecimiento.',
  },
  {
    pregunta: '¿Qué documento deben firmar los padres o tutores y docentes para recibir el equipo?',
    respuesta: 'El padre, madre o tutor legal debe firmar el PRA-FOR-02 y el Acta de Compromiso Institucional; los docentes firman el PRA-FOR-03. Sin esas firmas, la escuela no puede entregar el equipo ni la conectividad.',
  },
  {
    pregunta: '¿Qué pasa si la tableta se daña por un golpe o es robada?',
    respuesta: 'El Ministerio entrega una sola tableta por estudiante y por docente. El cuidado, resguardo y buen uso del equipo es responsabilidad exclusiva del beneficiario.',
  },
  {
    pregunta: '¿Para qué fines pueden usar los estudiantes y docentes esta tableta?',
    respuesta: 'Exclusivamente para fines educativos. El servicio de internet incluye filtros y bloqueos para que sólo se navegue en portales educativos oficiales y plataformas de estudio autorizadas.',
  },
  {
    pregunta: '¿Qué pasa si la tableta presenta desperfectos de fábrica o no enciende?',
    respuesta: 'Todas las tabletas tienen un año de garantía obligatoria por escrito. Si falla la batería, no reconoce el chip o la pantalla falla por defecto de fábrica, el proveedor debe repararla o reemplazarla sin costo.',
  },
  {
    pregunta: '¿A nombre de quién debe registrarse el chip de internet?',
    respuesta: 'A nombre del padre, madre o tutor legal del estudiante beneficiario; en el caso de los docentes, a nombre de cada uno de ellos.',
  },
  {
    pregunta: '¿Qué pasa si buscamos las tabletas con los proveedores y nos informan que no hay existencias?',
    respuesta: 'Es una situación previsible en un proyecto nuevo y masivo. Se espera que los proveedores vayan surtiendo el mercado de forma progresiva conforme aumente la oferta.',
  },
  {
    pregunta: '¿Qué pasa si acudimos a la empresa de telefonía y aún no disponen de este plan de internet de Q600?',
    respuesta: 'Al ser una iniciativa de reciente implementación, se espera que las empresas de telefonía diseñen y pongan a disposición planes que se adapten a los requisitos de cobertura, características técnicas y presupuesto del programa.',
  },
  {
    pregunta: 'Si el internet de la escuela tiene mejor señal que el chip entregado, ¿pueden los alumnos conectar sus tabletas a la red del establecimiento?',
    respuesta: 'Sí, totalmente. Además de su propio chip, los dispositivos también pueden conectarse a redes Wi-Fi.',
  },
  {
    pregunta: '¿Las tabletas sustituyen por completo a los cuadernos y libros de texto impresos?',
    respuesta: 'No. La tableta es un recurso educativo complementario; no sustituye la escritura a mano, la lectura en papel ni los libros de texto del Ministerio de Educación.',
  },
  {
    pregunta: '¿El docente también recibe un chip de internet de Q600 financiado por la OPF?',
    respuesta: 'Sí. Los docentes del ciclo diversificado también reciben este beneficio, a través de los recursos asignados a la OPF bajo el programa de valija didáctica.',
  },
]

/** Tipo de Destino | Nombre del Destino | URL del Destino — paquete de navegación estudiantil. */
const columnasNavegacion = [
  { title: 'CATEGORÍA', key: 'categoria', width: '220px' },
  { title: 'SITIO', key: 'nombre' },
  { title: 'DIRECCIÓN', key: 'url' },
]

const paqueteNavegacion = [
  { categoria: 'Inteligencia Artificial', nombre: 'ChatGPT', url: 'openai.com' },
  { categoria: 'Inteligencia Artificial', nombre: 'ChatGPT', url: 'chatgpt.com' },
  { categoria: 'Inteligencia Artificial', nombre: 'Microsoft Copilot', url: 'copilot.microsoft.com' },
  { categoria: 'Inteligencia Artificial', nombre: 'Claude', url: 'anthropic.com' },
  { categoria: 'Inteligencia Artificial', nombre: 'Gemini', url: 'gemini.google.com' },
  { categoria: 'Inteligencia Artificial', nombre: 'Perplexity', url: 'perplexity.ai' },
  { categoria: 'Ecosistema Microsoft', nombre: 'Office 365', url: 'office.com' },
  { categoria: 'Ecosistema Microsoft', nombre: 'Office 365', url: 'microsoft365.com' },
  { categoria: 'Ecosistema Microsoft', nombre: 'Microsoft Teams', url: 'teams.microsoft.com' },
  { categoria: 'Ecosistema Microsoft', nombre: 'OneDrive', url: 'onedrive.live.com' },
  { categoria: 'Ecosistema Google', nombre: 'Google Workspace / General', url: 'google.com' },
  { categoria: 'Ecosistema Google', nombre: 'Google Classroom', url: 'classroom.google.com' },
  { categoria: 'Ecosistema Google', nombre: 'Google Drive', url: 'drive.google.com' },
  { categoria: 'Ecosistema Google', nombre: 'Google Meet', url: 'meet.google.com' },
  { categoria: 'Ecosistema Google', nombre: 'Gmail / Correo', url: 'mail.google.com' },
  { categoria: 'Plataformas de Cursos', nombre: 'Coursera', url: 'coursera.org' },
  { categoria: 'Plataformas de Cursos', nombre: 'Odilo', url: 'odilo.us' },
  { categoria: 'Plataformas de Cursos', nombre: 'Fiction Express', url: 'fictionexpress.com' },
  { categoria: 'Plataformas de Cursos', nombre: 'Khan Academy', url: 'khanacademy.org' },
  { categoria: 'Plataformas de Cursos', nombre: 'Onfire Learning', url: 'onfirelearning.com' },
  { categoria: 'Plataformas de Cursos', nombre: 'Pathbooks', url: 'pathbooks.gt' },
  { categoria: 'Plataformas de Cursos', nombre: 'Explorax GT', url: 'explorax.app' },
  { categoria: 'Universidades de Guatemala', nombre: 'USAC', url: 'usac.edu.gt' },
  { categoria: 'Universidades de Guatemala', nombre: 'Universidad Mariano Gálvez', url: 'umg.edu.gt' },
  { categoria: 'Universidades de Guatemala', nombre: 'Universidad Rafael Landívar', url: 'url.edu.gt' },
  { categoria: 'Universidades de Guatemala', nombre: 'Universidad del Valle de Guatemala', url: 'uvg.edu.gt' },
  { categoria: 'Universidades de Guatemala', nombre: 'Universidad Galileo', url: 'galileo.edu' },
  { categoria: 'Universidades de Guatemala', nombre: 'Universidad del Istmo', url: 'unis.edu.gt' },
  { categoria: 'Sistemas de aprendizaje LMS', nombre: 'Canvas LMS', url: 'instructure.com' },
  { categoria: 'Sistemas de aprendizaje LMS', nombre: 'Canvas LMS', url: 'canvaslms.com' },
  { categoria: 'Herramientas Creativas', nombre: 'Canva', url: 'canva.com' },
  { categoria: 'Herramientas Creativas', nombre: 'Scratch', url: 'scratch.mit.edu' },
  { categoria: 'Recursos STEM y Pruebas', nombre: 'PruebaT', url: 'pruebat.org' },
  { categoria: 'Recursos STEM y Pruebas', nombre: 'PhET Simulación', url: 'phet.colorado.edu' },
  { categoria: 'Recursos STEM y Pruebas', nombre: 'GeoGebra', url: 'geogebra.org' },
  { categoria: 'Institucionales MINEDUC', nombre: 'Portal MINEDUC', url: 'mineduc.gob.gt' },
  { categoria: 'Institucionales MINEDUC', nombre: 'Portal Educativo MINEDUC', url: 'mineduc.edu.gt' },
  { categoria: 'Institucionales MINEDUC', nombre: 'DIGEDUCA', url: 'digeduca.ct.gt' },
  { categoria: 'Comunicación y Video', nombre: 'WhatsApp', url: 'whatsapp.com' },
  { categoria: 'Comunicación y Video', nombre: 'Zoom', url: 'zoom.us' },
  { categoria: 'Comunicación y Video', nombre: 'YouTube Edu', url: 'youtube.com/education' },
  { categoria: 'Enciclopedias y Lenguaje', nombre: 'Wikipedia', url: 'wikipedia.org' },
  { categoria: 'Enciclopedias y Lenguaje', nombre: 'Duolingo', url: 'duolingo.com' },
  { categoria: 'Becas y Futuro', nombre: 'SEGEPLAN Becas', url: 'becas.segeplan.gob.gt' },
  { categoria: 'Becas y Futuro', nombre: 'Becas Fundación JBG', url: 'fundacionjbg.org' },
  { categoria: 'Gobierno y Trámites', nombre: 'Portal del Gobierno de Guatemala', url: 'guatemala.gob.gt' },
  { categoria: 'Gobierno y Trámites', nombre: 'RENAP', url: 'renap.gob.gt' },
  { categoria: 'Gobierno y Trámites', nombre: 'SAT', url: 'portal.sat.gob.gt' },
  { categoria: 'Gobierno y Trámites', nombre: 'Policía Nacional Civil (PNC)', url: 'policianacionalcivil.gob.gt' },
  { categoria: 'Gobierno y Trámites', nombre: 'Ministerio Público (MP)', url: 'mp.gob.gt' },
  { categoria: 'Gobierno y Trámites', nombre: 'Ministerio de Finanzas Públicas (MINFIN)', url: 'minfin.gob.gt' },
  { categoria: 'Gobierno y Trámites', nombre: 'Ministerio de Cultura y Deportes (MCD)', url: 'mcd.gob.gt' },
]

const filtroNavegacion = ref('')

/* ── Soporte y orientación (Tabletas y OPF) ──────────────────────────────
   Transcrito del material informativo oficial de soporte DIGIKAL/DIGECADE
   (mismo criterio que el resto del contenido del programa: es texto de
   referencia fijo, no datos de la API). */

const consultasOpf = [
  {
    titulo: 'Compra y características',
    icono: 'mdi-cart-outline',
    texto: 'Orientación sobre los criterios técnicos de la tableta y el servicio de conectividad según los lineamientos del programa.',
  },
  {
    titulo: 'Entrega y documentación',
    icono: 'mdi-file-document-outline',
    texto: 'Consultas sobre entrega en el centro educativo, formularios, actas de compromiso, registro técnico y documentación de respaldo.',
  },
  {
    titulo: 'Conectividad',
    icono: 'mdi-wifi',
    texto: 'Consultas sobre chip/SIM físico, cobertura, pago único hasta Q600, vigencia de 12 meses y condiciones del servicio.',
  },
  {
    titulo: 'Garantía y funcionamiento',
    icono: 'mdi-shield-check-outline',
    texto: 'Orientación inicial ante fallas de fábrica, garantía mínima de un año y contacto de soporte con el proveedor.',
  },
  {
    titulo: 'Cuenta institucional',
    icono: 'mdi-account-circle-outline',
    texto: 'La tableta debe asociarse a la cuenta institucional asignada por Mineduc (@mineduc.edu.gt) para acceder a las plataformas y recursos educativos.',
  },
]

const infoClaveOpf = [
  'La asignación contempla Q2,000 para la tableta y Q600 para conectividad por 12 meses.',
  'La conectividad debe contratarse mediante un pago único y con SIM física.',
  'La tableta debe cumplir las especificaciones técnicas establecidas y contar con garantía mínima de un año.',
  'La entrega se realiza en el centro educativo y requiere la documentación correspondiente: PRA-FOR-02 (estudiantes) y PRA-FOR-03 (docentes).',
]

onMounted(() => {
  cargarResumen()
})
</script>

<style scoped>
.vista-ciudadania {
  background: #f8fafc;
  min-height: 100%;
}

/* ===== Cabecera compacta: título + montos + botón de alta ===== */
.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cabecera__texto {
  max-width: 640px;
}

.cabecera__acciones {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* ===== Hero: búsquedas + tablet 3D ===== */
.hero-card {
  background: #fff;
}

.hero-card__texto {
  overflow: hidden;
}

.hero-busqueda:first-child h3 {
  margin-top: 0;
}

/* ===== Conteo de tablets por establecimiento (columna izquierda) ===== */
.conteo-tablets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.conteo-tablets__dato {
  display: flex;
  align-items: baseline;
  gap: 6px;
  background: #eef4fa;
  border-radius: 10px;
  padding: 6px 12px;
}

.conteo-tablets__dato strong {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0094D3;
}

.conteo-tablets__dato span {
  font-size: 0.78rem;
  color: #475569;
}

.conteo-tablets__dato--total {
  background: #003366;
}

.conteo-tablets__dato--total strong,
.conteo-tablets__dato--total span {
  color: #fff;
}

.hero-card__tablet {
  /* relative: el botón de "Cerrar app" se ancla a esta caja */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #eef4fa 0%, #ffffff 100%);
  border-left: 1px solid rgba(0, 51, 102, 0.08);
  /* Poco relleno: cada píxel que se le quita al margen se lo queda la tablet,
     que es lo que hay que poder leer. */
  padding: 10px;
}

/* Alto fijo a propósito. Si la caja se estira para acompañar a la columna de
   resultados, se vuelve más alta que ancha y el encuadre de la tablet pasa a
   estar limitado por el ancho: la tablet se ve MÁS pequeña, no más grande. */
.tablet3d-frame {
  display: block;
  width: 100%;
  height: 660px;
  border: 0;
  background: transparent;
}

/* Encima de la escena 3D, en una esquina donde no tapa la tablet. */
.tablet3d-cerrar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
}

.hero-montos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-montos__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  border-radius: 12px;
  background: #eef4fa;
  font-size: 0.78rem;
  color: #475569;
  min-width: 128px;
}

.hero-montos__item strong {
  font-size: 1.15rem;
  color: #003366;
}

.hero-montos__item--total {
  background: linear-gradient(135deg, #003366 0%, #0094D3 100%);
}

.hero-montos__item--total span,
.hero-montos__item--total strong {
  color: #fff;
}

@media (max-width: 959px) {
  .hero-card__tablet {
    border-left: none;
    border-top: 1px solid rgba(0, 51, 102, 0.08);
  }
  /* En móvil la tablet se queda de pie (ver mejorOrientacion() en
     Tablet3D.vue), así que la caja se hace alta y estrecha para acompañarla:
     con una proporción parecida a la suya (~0.67) la tablet llena la caja por
     los dos lados y el contenido de la pantalla se lee mucho mejor. Con una
     caja cuadrada sobraba ancho y la tablet salía pequeña. */
  .tablet3d-frame {
    height: 580px;
  }
}

@media (max-width: 600px) {
  .cabecera {
    flex-direction: column;
    align-items: stretch;
  }
  .cabecera__acciones {
    justify-content: space-between;
  }
}

.mapa-card {
  min-height: 440px;
  display: flex;
  flex-direction: column;
}

/* ===== Panel de información del programa (acordeón) ===== */
.panel-info {
  border-top: 1px solid rgba(0, 51, 102, 0.1);
}

.panel-info :deep(.v-expansion-panel-title) {
  color: #0c3b66;
}

/* Especificación individual (letra + título + texto), reutilizada para
   dispositivo e internet. */
.spec-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  height: 100%;
  padding: 8px 0;
}

.spec-item__letra {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #003366;
  color: #fff;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-item__titulo {
  font-weight: 700;
  font-size: 0.85rem;
  color: #1e293b;
}

.spec-item__texto {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

/* ===== Lineamientos para OPF ===== */
.lineamiento-item {
  padding: 10px 0;
  border-bottom: 1px solid #eef2f8;
}

.lineamiento-item:last-child {
  border-bottom: none;
}

.lineamiento-item__titulo {
  font-weight: 700;
  font-size: 0.85rem;
  color: #003366;
  margin-bottom: 3px;
}

.lineamiento-item__texto {
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.55;
}

/* ===== Listas de verificación ===== */
.verificacion-lista__titulo {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #64748b;
  margin-bottom: 6px;
}

.verificacion-fila {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #1e293b;
  padding: 4px 0;
}

/* El acordeón de preguntas frecuentes va DENTRO de otro acordeón: un fondo
   distinto evita que se confundan como el mismo nivel de jerarquía. */
.panel-faq {
  background: #f8fafc;
  border-radius: 8px;
}

/* La tabla de sitios permitidos puede ser más ancha que la pantalla en móvil;
   hace scroll dentro de su propia caja en vez de desbordar la página. */
.tabla-scroll {
  overflow-x: auto;
}

.enlace-navegacion {
  color: #0094D3;
  text-decoration: none;
  font-weight: 600;
}

.enlace-navegacion:hover {
  text-decoration: underline;
}

.ranking-card {
  min-height: 440px;
  overflow-y: auto;
}

.ranking-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-fila {
  display: grid;
  grid-template-columns: 22px 1fr 90px 32px;
  align-items: center;
  gap: 10px;
}

.ranking-fila__pos {
  font-weight: 800;
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: right;
}

.ranking-fila__nombre {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-fila__barra-fondo {
  background: #eef2f8;
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
}

.ranking-fila__barra {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #0094D3, #003366);
}

.ranking-fila__cantidad {
  font-weight: 700;
  font-size: 0.85rem;
  color: #003366;
  text-align: right;
}

.resultados-establecimiento {
  max-height: 320px;
  overflow-y: auto;
}

/* ===== Soporte y orientación (Tabletas y OPF) ===== */
.soporte-opf {
  overflow: hidden;
}

.soporte-opf__cab {
  background: linear-gradient(120deg, #003366 0%, #0094D3 100%);
  color: #fff;
  padding: 24px 28px;
}

.soporte-opf__kicker {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.soporte-opf__titulo {
  margin: 6px 0 2px;
  font-size: 1.4rem;
  font-weight: 800;
}

.soporte-opf__subtitulo-cab {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.92;
}

.soporte-opf__subtitulo {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: #003366;
  margin-bottom: 14px;
}

.canal-atencion {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  height: 100%;
  padding: 14px 16px;
  background: #eef4fa;
  border-radius: 14px;
}

.canal-atencion__etiqueta {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.canal-atencion__numero {
  font-size: 1.05rem;
  font-weight: 800;
  color: #003366;
  line-height: 1.3;
}

.canal-atencion__ext {
  font-size: 0.8rem;
  color: #475569;
  margin-top: 4px;
}

.consulta-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f8;
}

.consulta-item:last-of-type {
  border-bottom: none;
}

.consulta-item__titulo {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0c3b66;
  margin-bottom: 2px;
}

.consulta-item__texto {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
}

.soporte-opf__info-clave {
  margin: 0;
  padding-left: 18px;
  font-size: 0.85rem;
  line-height: 1.6;
}

.soporte-opf__nota {
  margin: 16px 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 600px) {
  .soporte-opf__cab {
    padding: 20px;
  }
}
</style>
