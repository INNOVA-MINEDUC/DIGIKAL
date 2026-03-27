<template>
    <v-container fluid class="pa-0" >
      <div class="reveal-background">
        <HomeFooter />
      </div>

  
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

  
  const documentHeight = document.documentElement.scrollHeight - windowHeight
  const scrolled = scrollTop / documentHeight 


  const translateY = -scrolled * 300
  curtain.value.style.transform = `translateY(${translateY}px)`
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() 
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>

.reveal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;

  background-image: url("/fondo.png");
  background-size: cover;      
  background-position: center; 
  background-repeat: no-repeat;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  z-index: 1;
  pointer-events: none;

}



.curtain {
  position: relative;
  min-height: 100vh;
  background: #fff;
  z-index: 2;
  will-change: transform;
  transform: translateY(0);

  backface-visibility: hidden;
  perspective: 1000;
  /* background-color: transparent; */
}
</style>