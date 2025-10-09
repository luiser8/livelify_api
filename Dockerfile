# ---- Etapa 1: Builder ----
# Aquí se instalan dependencias y se compila el código.
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Habilitamos pnpm
RUN corepack enable

# Copiamos archivos de dependencias e instalamos todo
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --unsafe-perm

# Copiamos el resto del código
COPY . .

# Generamos el cliente de Prisma (no necesita conexión a la BD)
RUN pnpm prisma:generate

# ❌ NO SE EJECUTAN MIGRACIONES AQUÍ

# Construimos la aplicación TypeScript a JavaScript
RUN pnpm build

# Eliminamos dependencias de desarrollo para aligerar node_modules
RUN pnpm prune --prod

# ---- Etapa 2: Runner ----
# Esta es la imagen final, ligera y lista para producción.
FROM node:22-alpine

WORKDIR /usr/src/app

# Copiamos solo lo necesario desde la etapa 'builder'
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
# Copiamos la carpeta prisma para que el schema esté disponible en el job de migración.
COPY --from=builder /usr/src/app/prisma ./prisma

# Comando final para ejecutar la aplicación
CMD ["node", "dist/src/main.js"]

