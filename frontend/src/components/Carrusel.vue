<template>
  <div class="carousel">

    <!-- Flechas -->
    <button class="arrow left" @click="prev">‹</button>
    <button class="arrow right" @click="next">›</button>

    <!-- Slides -->
    <div class="track" :style="trackStyle">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="slide"
        @mouseenter="hoverIndex = i"
        @mouseleave="hoverIndex = null"
        @click="activeIndex = i"
      >
        <img class="image-placeholder" :src="item.img">
          
        </img>

        <div
          class="label"
          :class="{
            active: activeIndex === i,
            hover: hoverIndex === i
          }"
        >
          {{ item.title }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { title: 'Conectividad', img: "/img2.png" },
  { title: 'Dotación de Equipo', img: "/img3.png" },
  { title: 'Contenido Digital', img: "/img4.png" },
  { title: 'Formación', img: "/img2.png" },
  { title: 'SIGE', img: "/img3.png" }
])

const current = ref(0)
const hoverIndex = ref(null)
const activeIndex = ref(0)

const slideWidth = 25 // % visible

const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * slideWidth}%)`
}))

function next() {
  if (current.value < items.value.length - 4)
    current.value++
}

function prev() {
  if (current.value > 0)
    current.value--
}
</script>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  padding: 20px 40px;
}

.track {
  display: flex;
  gap: 4px; /* espacio real entre slides */
  transition: transform 0.4s ease;
}

.slide {
  min-width: calc(25% - 6px);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.image-placeholder {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block; /* elimina espacios invisibles */
}

.label {
  padding: 18px;
  text-align: center;
  font-weight: 800;
  background: #0d3b5d;
  color: white;
  transition: all 0.25s ease;
}

.label.hover {
  background: #1fb6c9;
  color: #0d3b5d;
}

.label.active {
  background: #2ec4d6;
  color: #0d3b5d;
}

.arrow {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 22px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 10;
}

.left { left: 5px; }
.right { right: 5px; }

.arrow:hover {
  background: #e2e8f0;
}

/* Responsive */

@media (max-width: 900px) {
  .slide {
    min-width: calc(50% - 6px);
  }
}

@media (max-width: 600px) {
  .slide {
    min-width: 100%;
  }
}

</style>
