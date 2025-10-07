# ---- Etapa 1: Builder ----
# Aquí instalamos todo y compilamos la aplicación.
FROM node:22-alpine AS builder

# Establecemos el directorio de trabajo.
WORKDIR /usr/src/app

# Pasamos y establecemos la variable de entorno para la base de datos.
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Habilitamos pnpm.
RUN corepack enable

# Copiamos solo los archivos de dependencias para aprovechar el caché.
COPY package.json pnpm-lock.yaml* ./

# Instalamos TODAS las dependencias para poder construir y generar prisma.
RUN pnpm install --unsafe-perm

# Copiamos el resto del código fuente.
COPY . .

# Generamos el cliente de Prisma.
RUN pnpm exec prisma generate

# Aplicamos las migraciones.
RUN pnpm exec prisma migrate deploy

# Construimos la aplicación.
RUN pnpm run build

# Eliminamos las devDependencies para preparar los node_modules para producción.
RUN pnpm prune --prod


# ---- Etapa 2: Runner ----
# Esta es la imagen final, será mucho más pequeña y segura.
FROM node:22-alpine

# Establecemos el directorio de trabajo.
WORKDIR /usr/src/app

# Copiamos los node_modules (solo de producción) desde la etapa 'builder'.
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copiamos la aplicación ya compilada (la carpeta 'dist') desde la etapa 'builder'.
COPY --from=builder /usr/src/app/dist ./dist

# Copiamos package.json por si algún paquete lo necesita en tiempo de ejecución.
COPY --from=builder /usr/src/app/package.json ./

# El comando final para ejecutar la aplicación compilada.
# Asegúrate de que la ruta sea la correcta (dist/main.js o dist/src/main.js).
CMD ["node", "dist/src/main.js"]
