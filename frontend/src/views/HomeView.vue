<template>
    <v-container fluid class="pa-0" >
      <div class="reveal-background">
        <HomeFooter />
      </div>

      <!-- La "cortina" blanca que contiene todo tu contenido normal -->
      <div ref="curtain" class="curtain">
        <HomeContent />
      </div>
    </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HomeContent from '@/components/HomeContent.vue'
import HomeFooter from '@/components/HomeFooter.vue'

const curtain = ref(null)

const handleScroll = () => {
  if (!curtain.value) return

  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight

  

  // Calculamos cuánto hemos scrolleado como porcentaje del contenido total
  const documentHeight = document.documentElement.scrollHeight - windowHeight
  const scrolled = scrollTop / documentHeight 

  // Movemos la cortina hacia arriba (máximo 100vh)
  const translateY = -scrolled * 420
  curtain.value.style.transform = `translateY(${translateY}px)`
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // inicializar
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>

/* Fondo negro fijo que siempre está detrás */
.reveal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;

  background-image: url("/fondo.png");
  background-size: cover;      /* 👈 hace que la imagen cubra todo */
  background-position: center; /* 👈 centra la imagen */
  background-repeat: no-repeat;/* 👈 evita repeticiones */
  /* opcional: gradiente bonito */
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  z-index: 1;
  pointer-events: none;
  /* permite hacer scroll aunque esté encima */
}


/* La cortina blanca que sube */
.curtain {
  position: relative;
  min-height: 100vh;
  background: #fff;
  /* o el color que use tu tema */
  z-index: 2;
  will-change: transform;
  transform: translateY(0);
  /* Optimización GPU */
  backface-visibility: hidden;
  perspective: 1000;
  /* background-color: transparent; */
}
</style>