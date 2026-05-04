<template>
  <v-footer class="footer">
    <v-container>
      <v-row>

        <!-- LOGO Y DESCRIPCIÓN -->
        <v-col cols="12" md="4">
          <div class="logo-section">
            <img src="/footer/img_18.png" class="logo" />
            <p>Dirección General de Gestión de Calidad Educativa</p>
          </div>

          <div class="info">
            <div class="item">
              <img src="/footer/img_6.png" alt="ubicación" style="">
              <p>6a. Calle 1-87, Zona 10, Ciudad de Guatemala</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="teléfono">
              <p>PBX +502 2411-9595</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="correo">
              <p>cegarcia@mineduc.gob.gt</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="web">
              <p>edu.mineduc.gob.gt/DIGECADE</p>
            </div>
          </div>
        </v-col>

        <!-- SUBDIRECCIÓN -->
        <v-col cols="12" md="4">
          <h3>SUBDIRECCIÓN / CONTACTOS</h3>

          <div class="info">
            <div class="item">
              <img src="/footer/img_12.png" alt="directora">
              <p>Directora: Claudia E. Morales García</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="extensiones">
              <p>Extensiones internas</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="directorio">
              <p>Directorio oficial MINEDUC</p>
            </div>
          </div>
        </v-col>

        <!-- CONTACTOS EXTRA -->
        <v-col cols="12" md="4">
          <h3>SUBDIRECCIÓN / CONTACTOS</h3>

          <div class="info">
            <div class="item">
              <img src="/footer/img_12.png" alt="innovación">
              <p>Centro de Capacitación Tecnológica - INNOVA</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="blog">
              <p>cctmineduc.blogspot.com</p>
            </div>

            <div class="item">
              <img src="/footer/img_12.png" alt="contacto">
              <p>Contacto vía DIGECADE / MINEDUC</p>
            </div>

            <div class="item nota-item">
              <img src="/footer/img_12.png" alt="nota">
              <p>
                Información pública tomada del sitio oficial del Ministerio de Educación de Guatemala.
              </p>
            </div>
          </div>
        </v-col>

      </v-row>

      <!-- LINEA -->
      <v-divider class="my-4"></v-divider>

      <!-- COPYRIGHT -->
      <div class="text-center copy">
        © 2023 ByteSpace. All rights reserved.
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
  opacity: 0.8;
}

/* TITULOS */
h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

/* GRID GENERAL */
.info {
  display: grid;
  gap: 12px;
}

/* ITEM (ICONO + TEXTO) */
.item {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: start;
  gap: 10px;
}

/* ICONOS */
.item img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-top: 3px;
}

/* TEXTO */
.item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

/* NOTA */
.nota-item p {
  font-size: 13px;
  opacity: 0.8;
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
    grid-template-columns: 18px 1fr;
    gap: 8px;
  }

  .item img {
    width: 14px;
    height: 14px;
  }

  .logo {
    width: 160px;
  }
}
</style>