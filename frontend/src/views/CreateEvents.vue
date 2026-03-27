<template>
  <div class="form-container">
    <h2>Crear Evento</h2>

    <form @submit.prevent="submitForm">

      <!-- IMAGEN -->
      <div class="form-group">
        <label>Imagen del evento</label>
        <input type="file" @change="handleImage" />
      </div>

      <!-- TITULO -->
      <div class="form-group">
        <label>Título</label>
        <input v-model="form.titulo" type="text" required />
      </div>

      <!-- FECHA -->
      <div class="form-group">
        <label>Fecha</label>
        <input v-model="form.fecha" type="date" required />
      </div>

      <!-- HORA -->
      <div class="form-group">
        <label>Hora</label>
        <input v-model="form.hora" type="time" required />
      </div>

      <!-- LUGAR -->
      <div class="form-group">
        <label>Lugar</label>
        <input v-model="form.lugar" type="text" required />
      </div>

      <!-- DESCRIPCIÓN -->
      <div class="form-group">
        <label>Descripción</label>
        <textarea v-model="form.descripcion" rows="4" required></textarea>
      </div>

      <!-- BOTON -->
      <button type="submit" class="btn">Crear Evento</button>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  titulo: '',
  fecha: '',
  hora: '',
  lugar: '',
  descripcion: '',
  imagen: null
})

// 📸 manejar imagen
const handleImage = (e) => {
  form.value.imagen = e.target.files[0]
}

// 🚀 enviar al backend
const submitForm = async () => {
  try {
    const data = new FormData()

    data.append('titulo', form.value.titulo)
    data.append('fecha', form.value.fecha)
    data.append('hora', form.value.hora)
    data.append('lugar', form.value.lugar)
    data.append('descripcion', form.value.descripcion)
    data.append('imagen', form.value.imagen)

    // 🔌 CAMBIA ESTA URL
    const res = await fetch('http://localhost:3000/api/eventos', {
      method: 'POST',
      body: data
    })

    const result = await res.json()

    console.log(result)
    alert('Evento creado 🚀')

  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

input, textarea {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.btn {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}
</style>