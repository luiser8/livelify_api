# ---- 1. Etapa de Construcción (Builder) ----
# Usamos una imagen completa de Node.js Alpine para la compilación
FROM node:22-alpine AS builder

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Habilitamos pnpm a través de corepack (el método moderno y recomendado)
RUN corepack enable

# Copiamos los archivos de definición de dependencias
# Asumiendo que usas pnpm-lock.yaml. Si no, quita esa parte.
COPY package.json pnpm-lock.yaml* ./ 2>/dev/null || true

# Instalamos TODAS las dependencias (incluyendo las de desarrollo para el build)
# --frozen-lockfile asegura compilaciones consistentes en CI/CD
# --unsafe-perm permite que paquetes como Prisma ejecuten sus scripts post-instalación
RUN pnpm install --frozen-lockfile --unsafe-perm

# Copiamos el resto del código fuente de la aplicación
COPY . .

# Construimos la aplicación
RUN pnpm run build

# Eliminamos las dependencias de desarrollo después de la compilación
RUN pnpm prune --prod


# ---- 2. Etapa de Producción (Production) ----
# Usamos una imagen base ligera y segura para el producto final
FROM node:22-alpine

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Establecemos el entorno a producción
ENV NODE_ENV=production

# Copiamos la aplicación compilada y las dependencias de producción desde la etapa 'builder'
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./

# Exponemos el puerto en el que corre tu aplicación
EXPOSE 3000

# El comando para iniciar tu aplicación.
# Tu versión anterior usaba "dist/src/main". A menudo es "dist/main.js".
# Asegúrate de que esta ruta coincida con el archivo de entrada de tu aplicación compilada.
CMD ["node", "dist/main.js"]
