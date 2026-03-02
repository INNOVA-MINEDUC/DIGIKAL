<template>
    <!-- Footer Fijo -->
<footer class="footer">
  <div class="container">
    <div class="row">

      <!-- Columna 1 - Dirección central / DIGECADE -->
      <div class="col-md-4">
        <img src="/icono.png" alt="MINEDUC Logo" class="footer-logo" />

        <div class="contact-info">
          <h4>DIGECADE</h4>
          <ul class="list-unstyled">
            <li>
              <v-icon icon="mdi-map-marker" class="me-2"></v-icon>
              6a. Calle 1-87, Zona 10, Ciudad de Guatemala
            </li>
            <li>
              <v-icon icon="mdi-phone" class="me-2"></v-icon>
              <a href="tel:+50224119595">PBX +502 2411-9595</a>
            </li>
            <li>
              <v-icon icon="mdi-email" class="me-2"></v-icon>
              <a href="mailto:cegarcia@mineduc.gob.gt">cegarcia@mineduc.gob.gt</a>
            </li>
            <li>
              <v-icon icon="mdi-web" class="me-2"></v-icon>
              <a href="https://edu.mineduc.gob.gt/DIGECADE/" target="_blank" rel="noopener">edu.mineduc.gob.gt/DIGECADE</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Columna 2 - Subdirecciones / Servicios relevantes -->
      <div class="col-md-4">
        <div class="contact-info">
          <h4>Subdirección / Contactos</h4>
          <ul class="list-unstyled">
            <li><v-icon icon="mdi-account-tie" class="me-2"></v-icon> Directora: Claudia E. Morales García (correo público)</li>
            <li><v-icon icon="mdi-phone" class="me-2"></v-icon> Extensiones internas (ver directorio oficial)</li>
            <li><v-icon icon="mdi-web" class="me-2"></v-icon> Directorio oficial: documentos públicos del MINEDUC</li>
          </ul>
        </div>
      </div>

      <!-- Columna 3 - INNOVA / CCT -->
      <div class="col-md-4">
        <div class="contact-info">
          <h4>INNOVA / CCT (Innovación Educativa)</h4>
          <ul class="list-unstyled">
            <li>
              <v-icon icon="mdi-lightbulb-on-outline" class="me-2"></v-icon>
              Centro de Capacitación Tecnológica - INNOVA
            </li>
            <li>
              <v-icon icon="mdi-web" class="me-2"></v-icon>
              <a href="https://cctmineduc.blogspot.com/" target="_blank" rel="noopener">cctmineduc.blogspot.com</a>
            </li>
            <li>
              <v-icon icon="mdi-email" class="me-2"></v-icon>
              (contacto vía DIGECADE / MINEDUC; ver página oficial para correos específicos)
            </li>
          </ul>
          <small class="text-muted d-block mt-2">
            Información pública tomada del sitio y directorio oficial del Ministerio de Educación de Guatemala.
          </small>
        </div>
      </div>

    </div>
  </div>
</footer>

</template>

<script setup>


// No se necesita JS para las animaciones — todo con CSS
</script>

<style scoped>

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-lg-8, .col-lg-4, .col-md-4 {
  padding: 0 15px;
}

.col-lg-8 { flex: 0 0 66.666%; }
.col-lg-4 { flex: 0 0 33.333%; }
.col-md-4 { flex: 0 0 33.333%; }

.d-flex {
  display: flex;
}

.align-items-center { align-items: center; }
.justify-content-end { justify-content: flex-end; }


/* IA Section */
.ia-section {
  background: var(--gray-bg);
  padding: 4rem 0;
  color: #333;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

/* Services & Platforms */
.services-section {
  /* background: var(--bg-dark); */
  color: white;
  padding: 5rem 0;
  text-align: center;
}

.services-title, .platforms-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.services-title span, .platforms-title span {
  color: #4f4f4f;
}

.separator {
  width: 100px;
  height: 4px;
  background: var(--primary);
  margin: 2rem auto;
  border-radius: 2px;
}

.services-intro {
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.1rem;
  line-height: 1.7;
}

.services-grid, .platforms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.service-item, .platform-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 8px;
  transition: var(--transition);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-item:hover, .platform-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-8px);
}

.service-item h3, .platform-item h3 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  line-height: 1.4;
}

.service-item a, .platform-item a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.service-item a:hover, .platform-item a:hover {
  color: var(--primary);
}

/* Footer */
.footer {
  background:rgba(0, 0, 0, .8);
  color: #aaa;
  padding: 10rem 0;
  position: relative;
  z-index: 1;
  width: 100%;
}

.footer-logo {
  max-width: 120px;
  margin-bottom: 2rem;
  border-radius: 5px;
}

.contact-info h4 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.contact-info ul {
  list-style: none;
}

.contact-info li {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.contact-info a {
  color: #aaa;
  text-decoration: none;
}

.contact-info a:hover {
  color: var(--primary);
}

.icon-office::before,
.icon-location::before,
.icon-phone::before,
.icon-envelope::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  margin-right: 0.5rem;
  color: var(--primary);
}

.icon-office::before { content: "\f19c"; }
.icon-location::before { content: "\f3c5"; }
.icon-phone::before { content: "\f095"; }
.icon-envelope::before { content: "\f0e0"; }




</style>