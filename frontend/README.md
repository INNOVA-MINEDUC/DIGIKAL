# DIGIKAL Frontend - Infraestructura y Documentación

Esta es la documentación arquitectónica para el Frontend construido en Vue 3 y Vite, configurado bajo estrictas prácticas de CI/CD (Continuous Integration / Continuous Deployment) e Infraestructura Inmutable.

## 🏗 Arquitectura de Despliegue (Docker Multi-Stage)

El proyecto utiliza un sistema de construcción Docker multi-etapas (`Dockerfile`) que otorga despliegues rápidos y de alta seguridad (The Twelve-Factor App):

1. **Etapa de Construcción (Builder):** Usa `node:20-alpine` para ejecutar una instalación limpia (`npm ci`) y compilar puramente estático (`npm run build`).
2. **Etapa de Producción (Nginx):** Los archivos resultantes son trasladados a una imagen `nginx:1.25-alpine`.
   * **Seguridad (Zero-Root):** El `Dockerfile` revoca los privilegios y corre los binarios de Nginx usando un usuario de bajos privilegios (`USER nginx`), protegiendo el sistema anfitrión si hubiese intrusiones lógicas.
   * **Nginx.conf:** Integrado con protección XSS de cabeceras seguras (X-Frame-Options) y listo para soportar flujos Single Page App (Vue-Router HTML5 Mode).

## 🚀 GitHub Actions y CI/CD

El repositorio cuenta con dos automatismos esenciales bajo el directorio `.github/workflows`:

### 1. Calidad Continua (`frontend-calidad.yml`)
Disparado en Pull Requests. Ejecuta auditorías obligatorias:
- **Linting:** Verifica que el código cumpla estándares (usa ESLint + configuración estricta para Vue 3 "Flat Config").
- **NPM Audit:** Valida la seguridad contra exploits y vulnerabilidades altas (CVEs conocidos dentro del lock file).

### 2. GitHub Container Registry (GHCR) Deployment (`frontend-deploy-ghcr.yml`)
Disparado al hacer Merge oficial en la rama `main`:
- Realiza login nativo (`secrets.GITHUB_TOKEN`) al registro GHCR (el apartado lateral invisible en los Repositorios de Github: Github Packages).
- Usa `Buildx` para **capas de Caché estática**, reduciendo minutos enteros de build a solo segundos si las dependencias no han cambiado.
- Versión por commit (`git-[hash]`) y Etiquetado Maestro (`latest`).

## ⚙️ Variables de Entorno y Producción (Runtime Injection)

Las aplicaciones Vite queman las variables durante el build. Para superar esta limitación técnica y mantener una sola imagen de producción agnóstica (`Build Once, Deploy Anywhere`), se creó un **Runtime Proxy** integrado al Dockerfile.

### El flujo es el siguiente:
1. Localmente el archivo `.env.production` proporciona variables FALSAS inyectadas en compilación (`__VUE_ENV_VITE_API_URL__`).
2. Así, `ghcr.io/innovadigikal/digikal-frontend:latest` queda sellada en la nube con esas falsas variables.
3. **En Producción**, puedes proporcionar libremente un **`docker-compose.yml`** con tu `.env` real de producción.
4. El Docker correrá **`entrypoint.sh`** durante el inicio del servidor, escrutará los archivos y hará un Hot-Swap reemplazando las variables falsas con tu `VITE_API_URL` real, antes de liberar Nginx.

### ⚠️ Muy Importante: ¿Cómo agregar NUEVAS variables en el futuro?

Si mañana debes agregar una variable extra (ej. una clave de mapas `VITE_MAP_KEY`):

1. **Agrégala falsa al archivo protector:**
Vete a `frontend/.env.production` y define tu marcador:
```env
VITE_MAP_KEY=__VUE_ENV_VITE_MAP_KEY__
```

2. **Enséñale a entrypoint.sh a buscarla:**
Vete a `frontend/entrypoint.sh` y clona la bandera `-e` de inyección de sed dentro del "ejecutable". Debe quedar algo así:
```sh
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) \
  -exec sed -i \
  -e "s|__VUE_ENV_VITE_API_URL__|${VITE_API_URL}|g" \
  -e "s|__VUE_ENV_VITE_MAP_KEY__|${VITE_MAP_KEY}|g" \
  {} \;
```
¡Esto garantizará que todas tus escalas mantengan este pipeline a prueba de balas!

---

## 💻 Comandos Locales (De Desarrollo Rápido)

Para desarrollar localmente sin Docker o en local host:

```sh
# Instalar dependencias
npm install

# Correr sistema normal (Hot-Reload)
npm run dev

# Pasar Linter estático manual
npm run lint

# Empaquetado puro de producción
npm run build
```
