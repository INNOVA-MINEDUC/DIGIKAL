import { createApp } from 'vue'


import router from './router'


import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


import { MotionPlugin } from '@vueuse/motion'


import '@mdi/font/css/materialdesignicons.css'


import '@fontsource/roboto/100.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import './assets/main.css'



import App from './App.vue'
import { createPinia } from "pinia"

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

createApp(App)
.use(createPinia())
.use(vuetify)
.use(MotionPlugin)
  .use(router)
  .mount('#app') 
