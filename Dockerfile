# ---- Dockerfile para Despliegue en Cloud Run (Ambiente de Desarrollo) ----
# Este Dockerfile instala dependencias de desarrollo y compila la aplicación,
# pero la ejecuta de una manera compatible con Cloud Run.

# Usamos una imagen base estándar de Node.js con Alpine.
FROM node:22-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /usr/src/app

# Establecemos el entorno a "development" para asegurar que se instalen las devDependencies.
ENV NODE_ENV=development

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

# PASO DE COMPILACIÓN: Compilamos la aplicación.
# El script 'start:dev' no genera una build persistente; necesitamos este paso.
RUN pnpm run build

# Exponemos el puerto que la aplicación escuchará (Cloud Run lo mapeará a 8080).
EXPOSE 3000

# COMANDO MODIFICADO: Ejecuta la aplicación ya compilada.
# No usamos 'start:dev' porque no es compatible con el entorno de Cloud Run.
# Usamos 'node' para ejecutar directamente el archivo de salida compilado.
# Esto asegura que la app respete la variable de entorno PORT que Cloud Run le proporciona.
CMD ["node", "dist/main.js"]
