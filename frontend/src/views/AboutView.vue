<template>
  <v-container fluid class="pa-0">
    <v-sheet
      height="400"
      class="d-flex align-center justify-center text-center white--text"
      color="primary"
      dark
    >
      <v-container>
        <h1 class="text-h2 font-weight-bold mb-4">Nuestra Historia</h1>
        <p class="text-h6">Transformando ideas en realidades digitales desde 2020.</p>
      </v-container>
    </v-sheet>

    <v-container class="py-12" max-width="1800">
      <v-row>
        <v-col cols="12" md="6">
          <v-card flat class="pa-4">
            <v-icon color="primary" size="48">mdi-rocket-launch</v-icon>
            <h2 class="text-h4 mt-4 mb-2">Misión</h2>
            <p class="text-body-1 grey--text text--darken-1">
              Proveer soluciones tecnológicas innovadoras que impulsen el crecimiento de nuestros clientes, 
              manteniendo la excelencia técnica y el compromiso humano.
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card flat class="pa-4">
            <v-icon color="secondary" size="48">mdi-eye</v-icon>
            <h2 class="text-h4 mt-4 mb-2">Visión</h2>
            <p class="text-body-1 grey--text text--darken-1">
              Ser referentes globales en el desarrollo de software, reconocidos por nuestra ética 
              de trabajo y la capacidad de resolver problemas complejos.
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    
    <!-- Sección: Innovación Estudiantil -->
<v-container class="py-12" max-width="1800">
  <v-row class="mb-8">
    <v-col cols="12" class="text-center">
      <h2 class="text-h3 font-weight-bold mb-4">
        Década de Innovación Estudiantil
      </h2>
      <p class="text-subtitle-1 grey--text text--darken-1">
        Diez años impulsando el talento joven y convirtiendo ideas académicas en
        soluciones tecnológicas reales.
      </p>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="6">
      <v-card flat class="pa-4">
        <v-icon color="primary" size="42">mdi-school</v-icon>
        <h3 class="text-h4 mt-4 mb-2">Origen Académico</h3>
        <p class="text-body-1 grey--text text--darken-1">
          Este proyecto surge como una iniciativa estudiantil dentro del ámbito
          universitario, donde durante más de una década se han desarrollado
          soluciones enfocadas en resolver problemáticas reales mediante tecnología,
          investigación aplicada y aprendizaje colaborativo.
        </p>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card flat class="pa-4">
        <v-icon color="secondary" size="42">mdi-lightbulb-on</v-icon>
        <h3 class="text-h4 mt-4 mb-2">Cultura de Innovación</h3>
        <p class="text-body-1 grey--text text--darken-1">
          La innovación estudiantil ha sido el motor principal del crecimiento,
          fomentando la creatividad, el pensamiento crítico y la experimentación
          constante como parte del proceso de formación profesional.
        </p>
      </v-card>
    </v-col>
  </v-row>

  <v-row class="mt-6">
    <v-col cols="12" md="6">
      <v-card flat class="pa-4">
        <v-icon color="primary" size="36">mdi-code-tags</v-icon>
        <h4 class="text-h4 mt-3 mb-2">Tecnología Aplicada</h4>
        <p class="text-body-1 grey--text text--darken-1">
          Desarrollo de software, aplicaciones web, plataformas educativas,
          automatización de procesos y prototipos funcionales creados por estudiantes
          con acompañamiento de mentores.
        </p>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card flat class="pa-4">
        <v-icon color="secondary" size="36">mdi-account-group</v-icon>
        <h4 class="text-h4 mt-3 mb-2">Trabajo Colaborativo</h4>
        <p class="text-body-1 grey--text text--darken-1">
          Equipos multidisciplinarios integrados por estudiantes, docentes y
          profesionales, replicando dinámicas reales de la industria tecnológica.
        </p>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card flat class="pa-4">
        <v-icon color="primary" size="36">mdi-trending-up</v-icon>
        <h4 class="text-h4 mt-3 mb-2">Impacto y Evolución</h4>
        <p class="text-body-1 grey--text text--darken-1">
          Muchos proyectos estudiantiles evolucionaron hacia productos reales,
          emprendimientos tecnológicos, startups y soluciones adoptadas por
          comunidades educativas y organizaciones.
        </p>
      </v-card>
    </v-col>
  </v-row>
</v-container>


    <v-sheet color="grey lighten-4" class="py-12">
      <v-container>
        <div class="text-center mb-10">
          <h2 class="text-h3 font-weight-bold">Nuestro Equipo</h2>
          <p class="text-subtitle-1">Las mentes detrás del éxito</p>
        </div>

        <v-row>
          <v-col 
            v-for="member in team" 
            :key="member.name" 
            cols="12" 
            sm="6" 
            md="4"
          >
            <v-card class="mx-auto text-center pa-6" elevation="2">
              <v-avatar size="120" class="mb-4">
                <v-img :src="member.image" style="filter: grayscale(1);" alt="Foto de equipo"></v-img>
              </v-avatar>
              <v-card-title class="justify-center">{{ member.name }}</v-card-title>
              <v-card-subtitle>{{ member.role }}</v-card-subtitle>
              <v-card-text>{{ member.bio }}</v-card-text>
              <v-card-actions class="justify-center">
                <v-btn icon color="blue lighten-1"><v-icon>mdi-linkedin</v-icon></v-btn>
                <v-btn icon color="blue-grey darken-3"><v-icon>mdi-github</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    
  </v-container>
</template>

<script>
export default {
  name: 'AboutUs',
  data: () => ({
    team: [
      {
        name: 'Ana García',
        role: 'CEO & Fundadora',
        bio: 'Experta en estrategia digital con más de 10 años en el sector.',
        image: 'https://randomuser.me/api/portraits/women/1.jpg'
      },
      {
        name: 'Carlos Ruiz',
        role: 'CTO',
        bio: 'Apasionado por la arquitectura de software y la inteligencia artificial.',
        image: 'https://randomuser.me/api/portraits/men/2.jpg'
      },
      {
        name: 'Elena Soto',
        role: 'Lead Designer',
        bio: 'Creadora de experiencias de usuario intuitivas y memorables.',
        image: 'https://randomuser.me/api/portraits/women/3.jpg'
      }
    ]
  })
}
</script>