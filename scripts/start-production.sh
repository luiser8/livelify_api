#!/bin/bash
# start-production.sh
# Script de inicio para contenedor de producción

set -e  # Exit on error

echo "🚀 Livelify API - Production Startup"
echo "===================================="
echo ""

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    exit 1
fi

echo "✅ Variables de entorno verificadas"
echo ""

# Aplicar migraciones pendientes
echo "🔄 Verificando y aplicando migraciones..."
if npx prisma migrate deploy; then
    echo "✅ Migraciones aplicadas exitosamente"
else
    echo "⚠️  Error al aplicar migraciones"
    echo "La aplicación continuará pero puede haber problemas"
fi
echo ""

# Generar cliente Prisma (por si acaso)
echo "📦 Generando cliente Prisma..."
npx prisma generate
echo ""

# Iniciar aplicación
echo "🎯 Iniciando aplicación..."
echo ""
exec node dist/main.js

