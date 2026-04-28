#!/bin/sh

# Asegurar que el servidor arroje un log indicando que inyecta en frío
echo "Iniciando inyección de variables de entorno de Docker a estáticos de Producción..."

# Remplazar los placeholders quemados por las variables reales montadas por docker
# Usamos el comando 'find' y 'sed' de Linux para encontrar y cambiar dentro del JS/HTML minificado
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i -e "s|__VUE_ENV_VITE_API_URL__|${VITE_API_URL}|g" {} \;

echo "Inyección completa. Arrancando Nginx..."

# Ejecutar el proceso normal que venía por defecto en Nginx o el CMD que proveas a Docker
exec "$@"
