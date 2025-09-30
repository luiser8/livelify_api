# ---- Dockerfile para Desarrollo ----
# Usamos una imagen base que incluye herramientas de compilación necesarias para algunos paquetes.
FROM node:22-alpine

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Establecemos el entorno a "development"
ENV NODE_ENV=development

# Habilitamos pnpm a través de corepack (el método recomendado)
RUN corepack enable

# Copiamos solo los archivos de definición de dependencias
# Esto aprovecha el cache de Docker. La instalación solo se repetirá si estos archivos cambian.
COPY package.json pnpm-lock.yaml* ./

# Instalamos TODAS las dependencias, incluyendo las de desarrollo
# --unsafe-perm es necesario para que paquetes como Prisma puedan ejecutar sus scripts de instalación
RUN pnpm install --unsafe-perm

# Copiamos el resto del código fuente de la aplicación al contenedor
COPY . .

# Exponemos el puerto de la aplicación
EXPOSE 3000

# El comando para iniciar la aplicación en modo "watch"
# Este comando reiniciará el servidor automáticamente cada vez que detecte un cambio en el código
CMD ["pnpm", "run", "start:dev"]
