import pluginVue from 'eslint-plugin-vue'

export default [
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // Configuraciones personalizadas o relajar reglas para que no bloqueen por ahora
      'vue/multi-word-component-names': 'off',
      // Vuetify usa nombres dinámicos de slots que chocan con la sintaxis estricta base
      'vue/valid-v-slot': 'off',
    }
  }
]
