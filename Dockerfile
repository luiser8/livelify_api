# ---- Etapa 1: Builder ----
# Aquí instalamos todo y compilamos la aplicación.
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Habilitamos pnpm.
RUN corepack enable

# Copiamos solo los archivos de dependencias para aprovechar el caché.
COPY package.json pnpm-lock.yaml* ./

# Instalamos TODAS las dependencias para poder construir y generar prisma.
RUN pnpm install --unsafe-perm

# Copiamos el resto del código fuente.
COPY . .

# Generamos el cliente de Prisma. No necesita conexión a la base de datos.
RUN pnpm exec prisma generate

# ❌ LA MIGRACIÓN NO SE EJECUTA AQUÍ

# Construimos la aplicación.
RUN pnpm run build

# Eliminamos las devDependencies para preparar los node_modules para producción.
RUN pnpm prune --prod


# ---- Etapa 2: Runner ----
# Esta es la imagen final, será mucho más pequeña y segura.
FROM node:22-alpine

WORKDIR /usr/src/app

# Esta línea es IMPORTANTE para Prisma
RUN apk add --no-cache openssl

# Copiamos los artefactos necesarios desde la etapa 'builder'.
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
# Copiamos la carpeta prisma para que el schema esté disponible en el job de migración.
COPY --from=builder /usr/src/app/prisma ./prisma

# El comando final para ejecutar la aplicación compilada.
CMD ["node", "dist/src/main.js"]
