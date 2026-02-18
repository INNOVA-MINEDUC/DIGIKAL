<template>
  <div class="back">
    <h1>Hola Mundo</h1>
  </div>

  <div class="front" ref="front">
    <div class="content">
      {{ "Hola mundo ".repeat(1000) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const front = ref(null)

const handleScroll = () => {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight - windowHeight
  const scrolled = scrollTop / documentHeight // 0 → 1

  // Cuando scrolled = 0 → translateY(0)
  // Cuando scrolled = 1 → translateY(-100vh)
  const translateY = -scrolled * windowHeight
  if (front.value) {
    front.value.style.transform = `translateY(${translateY}px)`
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // primera ejecución
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.back {
  position: fixed;
  inset: 0;
  background: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20vh;
  font-size: 4rem;
  font-weight: bold;
  z-index: 1;
}

.front {
  position: relative;
  min-height: 100vh;
  background: aliceblue;
  z-index: 2;
  /* La transformación la controla JS */
  will-change: transform; /* optimización GPU */
  transform: translateY(0);
}

.content {
  padding: 2rem;
}
</style>