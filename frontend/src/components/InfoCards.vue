<template>
  <v-container class="py-8">
    <v-row dense>
      <v-col
        v-for="(card, i) in cards"
        :key="i"
        cols="12"
        sm="6"
        md="3"
      >
        <div class="info-card">

          <!-- Imagen -->
          <div
            class="card-image"
            :style="{ backgroundImage: `url(${card.img})` }"
          ></div>

          <!-- Overlay -->
          <div class="card-overlay">
            <h3 class="card-title">{{ card.title }}</h3>
            <p class="card-description">
              {{ card.text }}
            </p>
          </div>

        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  cards: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.info-card {
  position: relative;
  height: 380px;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.4s ease;
}

.info-card:hover {
  transform: translateY(-6px);
}

/* Imagen */
.card-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

/* Overlay degradado */
.card-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  padding: 20px;
  color: white;

  background: linear-gradient(
    to top,
    rgba(6, 40, 66, 0.95) 0%,
    rgba(6, 40, 66, 0.85) 40%,
    rgba(6, 40, 66, 0.4) 70%,
    rgba(6, 40, 66, 0) 100%
  );
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

.card-description {
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: center;
}
</style>