# ---- Dockerfile para Despliegue en Cloud Run (Ambiente de Desarrollo) ----
# Este Dockerfile instala dependencias de desarrollo y compila la aplicación,
# pero la ejecuta de una manera compatible con Cloud Run.

# ARG declara un argumento que se puede pasar durante la construcción de la imagen.
ARG DATABASE_URL

# ENV hace que el argumento esté disponible como una variable de entorno para los comandos RUN.
ENV DATABASE_URL=$DATABASE_URL

# Usamos una imagen base estándar de Node.js con Alpine.
FROM node:22-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /usr/src/app

# Establecemos el entorno a "development" para asegurar que se instalen las devDependencies.
ENV APP_ENV=development

# Habilitamos pnpm a través de corepack, el método moderno y recomendado.
RUN corepack enable

# Copiamos solo los archivos de definición de dependencias.
# Esto aprovecha el caché de Docker. La instalación solo se repetirá si estos archivos cambian.
COPY package.json pnpm-lock.yaml* ./

# Instalamos TODAS las dependencias, incluyendo las de desarrollo.
# --unsafe-perm es necesario para que paquetes como Prisma puedan ejecutar sus scripts de instalación.
RUN pnpm install --unsafe-perm

# Copiamos el resto del código fuente de la aplicación al contenedor.
COPY . .

# PASO AÑADIDO CLAVE: Generar explícitamente el cliente de Prisma.
# Esto soluciona los errores de TypeScript al asegurar que PrismaClient esté disponible antes de la compilación.
RUN pnpm exec prisma generate

# PASO AÑADIDO CRÍTICO: Aplicar las migraciones de la base de datos.
# Esto asegura que el esquema de la base de datos esté sincronizado con el de la aplicación antes de arrancar.
# La falta de este paso es una causa común de fallos en el arranque.
RUN pnpm exec prisma migrate deploy

# PASO DE COMPILACIÓN: Compilamos la aplicación.
# El script 'start:dev' no genera una build persistente; necesitamos este paso.
RUN pnpm run build

# Exponemos el puerto que la aplicación escuchará (Cloud Run lo mapeará a 8080).
EXPOSE 3000

# COMANDO MODIFICADO: Ejecuta la aplicación ya compilada.
# No usamos 'start:dev' porque no es compatible con el entorno de Cloud Run.
# Usamos 'node' para ejecutar directamente el archivo de salida compilado.
# También he corregido la ruta de 'dist/main.js' a 'dist/main.js'.
CMD ["node", "dist/src/main.js"]
