<template>
  <v-footer class="footer">
    <v-container>
      <v-row>

        <!-- LOGO Y DESCRIPCIÓN -->
        <v-col cols="12" md="4">
          <div class="logo-section">
            <img src="/footer/img_18.png" class="logo" alt="MINEDUC" />
            <p>Dirección General de Gestión de Calidad Educativa (DIGECADE)</p>
          </div>
        </v-col>

        <!-- ESTRUCTURA INSTITUCIONAL -->
        <v-col cols="12" md="4">
          <h3>Estructura institucional</h3>

          <ul class="estructura">
            <li class="nivel-1">
              <v-icon size="18" class="mr-2">mdi-bank</v-icon>
              <div>
                <strong>MINEDUC</strong>
                <span>Ministerio de Educación</span>
              </div>
            </li>

            <li class="nivel-1">
              <v-icon size="18" class="mr-2">mdi-office-building</v-icon>
              <div>
                <strong>DIGECADE</strong>
                <span>Dirección General de Gestión de Calidad Educativa</span>
              </div>
            </li>

            <li class="nivel-1">
              <v-icon size="18" class="mr-2">mdi-lightbulb-on-outline</v-icon>
              <div>
                <strong>INNOVA</strong>
                <span>Subdirección de DIGECADE</span>
              </div>
            </li>
          </ul>
        </v-col>

        <!-- CONTACTO -->
        <v-col cols="12" md="4">
          <h3>Contacto</h3>

          <div class="info">
            <div class="item">
              <v-icon size="18">mdi-map-marker</v-icon>
              <p>6a. Calle 1-87, Zona 10, Ciudad de Guatemala</p>
            </div>

            <div class="item">
              <v-icon size="18">mdi-phone</v-icon>
              <p>PBX +502 2411-9595</p>
            </div>

            <div class="item">
              <v-icon size="18">mdi-email-outline</v-icon>
              <p>
                <a href="mailto:ayuda@mineduc.edu.gt" class="enlace">ayuda@mineduc.edu.gt</a>
              </p>
            </div>

            <div class="item">
              <v-icon size="18">mdi-web</v-icon>
              <p>
                <a
                  href="https://edu.mineduc.gob.gt/DIGECADE"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="enlace"
                >
                  edu.mineduc.gob.gt/DIGECADE
                </a>
              </p>
            </div>
          </div>
        </v-col>

      </v-row>

      <!-- LINEA -->
      <v-divider class="my-4"></v-divider>

      <!-- COPYRIGHT -->
      <div class="text-center copy">
        © 2026. Ministerio de Educación - Guatemala
      </div>

    </v-container>
  </v-footer>
</template>

<script setup>
// sin lógica por ahora
</script>

<style scoped>
.footer {
  background-color: #0b4c6c;
  color: white;
  padding: 40px 0;
  user-select: text;
}

/* LOGO */
.logo {
  width: 200px;
  margin-bottom: 10px;
}

.logo-section p {
  font-size: 14px;
  opacity: 0.85;
  line-height: 1.5;
}

/* TITULOS */
h3 {
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
}

/* ESTRUCTURA (jerarquía MINEDUC / DIGECADE / INNOVA) */
.estructura {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.estructura li {
  display: flex;
  align-items: flex-start;
}

.estructura li div {
  display: flex;
  flex-direction: column;
}

.estructura strong {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.estructura span {
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.3;
}

/* Sangría progresiva para reflejar la dependencia */
.nivel-2 {
  margin-left: 18px;
}

.nivel-3 {
  margin-left: 36px;
}

.estructura .v-icon {
  opacity: 0.9;
  margin-top: 2px;
}

/* CONTACTO (ICONO + TEXTO) */
.info {
  display: grid;
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: start;
  gap: 10px;
}

.item .v-icon {
  opacity: 0.9;
  margin-top: 2px;
}

.item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

/* ENLACES */
.enlace {
  color: #ffffff;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  transition: border-color 0.2s ease;
}

.enlace:hover {
  border-bottom-color: #ffffff;
}

/* COPYRIGHT */
.copy {
  font-size: 13px;
  opacity: 0.7;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .footer {
    text-align: left;
  }

  .item {
    grid-template-columns: 20px 1fr;
    gap: 8px;
  }

  .logo {
    width: 160px;
  }

  /* En móvil se reduce la sangría para no comprimir el texto */
  .nivel-2 { margin-left: 10px; }
  .nivel-3 { margin-left: 20px; }
}
</style>
