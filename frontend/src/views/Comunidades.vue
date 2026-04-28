<template>
    <div class="hero-wrapper">
    <img src="/comunities/img_1.png" class="hero-bg" alt="Fondo" />
  </div>
  <v-container class="py-10">
    <v-row class="mb-8">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold primary--text text--darken-3">
          Actualidad Educativa
        </h1>
        <v-divider class="mt-2" width="100" style="border-width: 2px; border-color: var(--v-primary-base)"></v-divider>
      </v-col>
    </v-row>

    <v-tabs v-model="tab" color="primary" class="mb-8">
      <v-tab class="font-weight-bold">
        <v-icon left>mdi-newspaper-variant-outline</v-icon>
        Noticias
      </v-tab>
      <v-tab class="font-weight-bold">
        <v-icon left>mdi-calendar-clock</v-icon>
        Calendario de Eventos
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-row>
          <v-col v-for="noticia in noticias" :key="noticia.id" cols="12" md="4">
            <v-hover v-slot="{ hover }">
              <v-card :elevation="hover ? 6 : 2" class="transition-swing h-100">
                <v-img :src="noticia.imagen" height="200">
                  <v-chip label small color="primary" class="ma-2 font-weight-bold">
                    {{ noticia.categoria }}
                  </v-chip>
                </v-img>

                <v-card-subtitle class="pb-0 grey--text text--darken-1">
                  {{ noticia.fecha }}
                </v-card-subtitle>

                <v-card-title class="text-h6 font-weight-bold line-height-tight">
                  {{ noticia.titulo }}
                </v-card-title>

                <v-card-text class="body-2">
                  {{ noticia.resumen }}
                </v-card-text>

                <v-spacer></v-spacer>

                <v-card-actions class="pa-4">
                  <v-btn text color="primary" class="font-weight-bold px-0">
                    LEER MÁS
                    <v-icon right small>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col v-for="evento in eventos" :key="evento.id" cols="12">
            <v-card outlined class="mb-4 pa-2 border-left-primary">
              <v-row align="center" no-gutters>
                <v-col cols="12" sm="2" class="text-center">
                  <div class="primary--text font-weight-black text-h4">{{ evento.dia }}</div>
                  <div class="text-uppercase font-weight-medium">{{ evento.mes }}</div>
                </v-col>

                <v-divider vertical class="mx-4 d-none d-sm-flex"></v-divider>

                <v-col cols="12" sm="7" class="pa-4">
                  <h3 class="text-h6 font-weight-bold mb-1">{{ evento.nombre }}</h3>
                  <div class="d-flex align-center grey--text text--darken-2 mb-2">
                    <v-icon small class="mr-1">mdi-clock-outline</v-icon>
                    <span class="caption mr-4">{{ evento.hora }}</span>
                    <v-icon small class="mr-1">mdi-map-marker-outline</v-icon>
                    <span class="caption">{{ evento.lugar }}</span>
                  </div>
                  <p class="body-2 mb-0">{{ evento.descripcion }}</p>
                </v-col>

                <v-col cols="12" sm="2" class="text-center">

                  <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                      <v-btn outlined color="secondary" small v-bind="activatorProps" text="Inscribirse"
                        variant="flat"></v-btn>
                    </template>

<template v-slot:default="{ isActive }">
                      <v-card title="Formulario">
                        <v-card-text>
                          Porfavor completar todos los campos de información
                        </v-card-text>

                        <v-card-text>
                          <v-form @submit.prevent style="display: flex; justify-content: center; align-items: center;">
                            <v-text-field label="Correo Electronico" style="width: 10px;" autocomplete="off" />
                          </v-form>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>

                          <v-btn text="Cancelar Formulario" @click="isActive.value = false"></v-btn>
                          <v-btn text="Enviar Formulario" color="primary" @click="isActive.value = false"></v-btn>
                        </v-card-actions>
                      </v-card>
                    </template>
</v-dialog>

</v-col>
</v-row>
</v-card>
</v-col>
</v-row>
</v-tab-item>
    </v-tabs-items>
  </v-container>
  <HomeFooter />
</template>

<script setup>
import { ref } from 'vue'
import HomeFooter from '@/components/HomeFooter.vue'

const tab = ref(null)

const noticias = ref([
  {
    id: 1,
    titulo: 'Inauguración de nuevas bibliotecas digitales en zonas rurales',
    resumen: 'El Ministerio expande la red de conectividad para beneficiar a más de 50,000 estudiantes.',
    fecha: '15 de Mayo, 2024',
    categoria: 'INFRAESTRUCTURA',
    imagen: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    titulo: 'Presentación de la politica DIGIKAL y avances de innovacción',
    resumen: 'Nueva convocatoria cerrada para directores departamentales con la finalidad de poder fortalezer alianzas y continuar innovando',
    fecha: '12 de Mayo, 2024',
    categoria: 'INSTITUCIONAL',
    imagen: 'https://preview.atlaq.com/fcd494ea67e944cc8ca14d051ad292e0_guatecompras.gt.png'
  },
  {
    id: 3,
    titulo: 'Lanzamineto de la plataforma de ASISTO',
    resumen: 'Se presentan una nueva plataforma educativa totalmente gratuita y plublica con el sin de ayudar a todos los docentes que imparten clases en los grados de primaria',
    fecha: '10 de Mayo, 2024',
    categoria: 'NACIONAL',
    imagen: '/astro2.png'
  }
])

const eventos = ref([
  {
    id: 1,
    dia: '22',
    mes: 'Mayo',
    nombre: 'Congreso Nacional de Innovación Educativa',
    hora: '09:00 AM',
    lugar: 'Auditorio Central',
    descripcion: 'Encuentro para discutir el futuro de la IA en las aulas de primaria.'
  },
  {
    id: 2,
    dia: '05',
    mes: 'Junio',
    nombre: 'Taller de Capacitación: Google Classroom',
    hora: '02:00 PM',
    lugar: 'Plataforma Virtual (Zoom)',
    descripcion: 'Sesión técnica para docentes de educación secundaria.'
  }
])
</script>

<style scoped>
.hero-wrapper {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  justify-self: center;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  /* filter: brightness(0.65); */
}

.line-height-tight {
  line-height: 1.25 !important;
  margin-bottom: 8px;
}

.border-left-primary {
  border-left: 5px solid #1976D2 !important;
}


.h-100 {
  display: flex;
  flex-direction: column;
}

.transition-swing {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>