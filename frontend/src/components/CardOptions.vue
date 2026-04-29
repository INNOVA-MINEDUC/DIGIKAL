<template>
  <v-container class="py-10">
    <v-row dense>
      <v-col
        v-for="(card, i) in cards"
        :key="i"
        cols="12"
        sm="6"
        md="4"
      >
        <div class="zoom-card">
          <div class="zoom-bg" :style="{ backgroundImage: `url(${card.img})` }"></div>

          <div class="zoom-content">
            <h3 class="title-top">{{ card.top }}</h3>
            <h2 class="title-main">{{ card.title }}</h2>
            

            <v-btn
            v-if="card.url"
            variant="outlined" class="mt-4 text-white" size="small" @click="routeTo(card.url)">
              Explorar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  cards: Array
})

function routeTo(url){
   window.open(url, '_blank')
}
</script>

<style scoped>
.zoom-card {
  position: relative;
  height: 380px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
}

.zoom-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
}

.zoom-card:hover .zoom-bg {
  transform: scale(1.12);
}

.zoom-content {
  position: absolute;
  inset: 0;
  color: white;
  padding: 20px;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  background: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0));
}

.title-top {
  font-size: 1.1rem;
  font-weight: 600;
}

.title-main {
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 5px;
}
</style>
