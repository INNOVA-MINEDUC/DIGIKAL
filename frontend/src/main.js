import { createApp } from 'vue'

// Rutas
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

//Animations
import { MotionPlugin } from '@vueuse/motion'

// Íconos de Material Design
import '@mdi/font/css/materialdesignicons.css'

// Fuentes de Roboto
import '@fontsource/roboto/100.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import './assets/main.css'


// Component principal
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

createApp(App)
.use(vuetify)
.use(MotionPlugin)
  .use(router)
  .mount('#app')
