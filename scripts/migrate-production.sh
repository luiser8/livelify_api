#!/bin/bash
# migrate-production.sh
# Script seguro para aplicar migraciones en producción

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Livelify Production Migration Script${NC}"
echo "========================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: No se encuentra prisma/schema.prisma${NC}"
    echo "Por favor ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar variables de entorno
if [ "$APP_ENV" != "production" ] && [ "$APP_ENV" != "qa" ]; then
    echo -e "${YELLOW}⚠️  APP_ENV no está configurado como 'production' o 'qa'${NC}"
    echo "APP_ENV actual: ${APP_ENV:-not set}"
    echo ""
    echo "¿Deseas continuar de todos modos? (yes/no)"
    read -r env_response
    if [ "$env_response" != "yes" ]; then
        echo -e "${RED}❌ Deployment cancelado${NC}"
        exit 1
    fi
fi

# Verificar conexión a base de datos
echo -e "${BLUE}🔍 Verificando conexión a base de datos...${NC}"
if ! npx prisma db pull --force --schema=./prisma/schema.prisma 2>&1 | grep -q "Introspected"; then
    echo -e "${RED}❌ Error: No se puede conectar a la base de datos${NC}"
    echo "Verifica tus variables de entorno y configuración de DATABASE_URL"
    exit 1
fi
echo -e "${GREEN}✅ Conexión a base de datos exitosa${NC}"
echo ""

# Verificar estado actual de migraciones
echo -e "${BLUE}📊 Verificando estado de migraciones...${NC}"
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
echo "$MIGRATION_STATUS"
echo ""

# Verificar si hay migraciones pendientes
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ No hay migraciones pendientes${NC}"
    echo "La base de datos ya está actualizada"
    exit 0
fi

# Advertencia crítica
echo -e "${RED}⚠️  ⚠️  ⚠️  ADVERTENCIA CRÍTICA ⚠️  ⚠️  ⚠️${NC}"
echo ""
echo "Este script aplicará migraciones a la base de datos de ${APP_ENV:-PRODUCCIÓN}"
echo ""
echo -e "${YELLOW}Antes de continuar, asegúrate de que:${NC}"
echo "  1. ✅ Has hecho BACKUP de la base de datos"
echo "  2. ✅ Las migraciones están probadas en QA"
echo "  3. ✅ Tienes un plan de rollback"
echo "  4. ✅ El equipo está notificado"
echo ""
echo -e "${RED}Esta acción es IRREVERSIBLE sin un backup${NC}"
echo ""
echo "¿Has hecho backup de la base de datos? (yes/no)"
read -r backup_response

if [ "$backup_response" != "yes" ]; then
    echo ""
    echo -e "${RED}❌ Deployment cancelado${NC}"
    echo ""
    echo -e "${YELLOW}Por favor ejecuta uno de estos comandos primero:${NC}"
    echo ""
    echo "# Para PostgreSQL local:"
    echo "pg_dump -h localhost -U postgres -d livelify -F c -f backup_\$(date +%Y%m%d_%H%M%S).dump"
    echo ""
    echo "# Para Cloud SQL (GCP):"
    echo "gcloud sql backups create --instance=livelify-prod --description='Pre-migration backup'"
    echo ""
    echo "# Para RDS (AWS):"
    echo "aws rds create-db-snapshot --db-instance-identifier livelify-prod --db-snapshot-identifier pre-migration-\$(date +%Y%m%d-%H%M%S)"
    echo ""
    exit 1
fi

# Confirmación final
echo ""
echo -e "${YELLOW}Última confirmación:${NC}"
echo "¿Estás ABSOLUTAMENTE SEGURO de que deseas aplicar las migraciones?"
echo "Escribe 'APLICAR MIGRACIONES' para continuar:"
read -r final_confirmation

if [ "$final_confirmation" != "APLICAR MIGRACIONES" ]; then
    echo -e "${RED}❌ Deployment cancelado${NC}"
    exit 1
fi

# Aplicar migraciones
echo ""
echo -e "${BLUE}🔄 Aplicando migraciones...${NC}"
echo ""

if npx prisma migrate deploy; then
    echo ""
    echo -e "${GREEN}✅ Migraciones aplicadas exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al aplicar migraciones${NC}"
    echo ""
    echo "Posibles acciones:"
    echo "1. Revisar los logs arriba para identificar el error"
    echo "2. Verificar el estado: npx prisma migrate status"
    echo "3. Contactar al equipo de DevOps"
    echo "4. Considerar rollback si es necesario"
    exit 1
fi

# Verificar estado final
echo ""
echo -e "${BLUE}🔍 Verificando estado final...${NC}"
npx prisma migrate status
echo ""

# Generar cliente Prisma (por si acaso)
echo -e "${BLUE}📦 Regenerando cliente Prisma...${NC}"
npx prisma generate
echo ""

# Resumen final
echo -e "${GREEN}✨ Deployment completado exitosamente ✨${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  1. Reiniciar la aplicación si es necesario"
echo "  2. Verificar logs de la aplicación"
echo "  3. Ejecutar smoke tests"
echo "  4. Monitorear métricas durante la próxima hora"
echo "  5. Mantener el backup por al menos 7 días"
echo ""
echo "Comandos útiles:"
echo "  # Ver logs de la app"
echo "  pm2 logs livelify_api"
echo "  # o"
echo "  docker logs <container-id>"
echo ""
echo "  # Smoke tests"
echo "  curl https://api.livelify.com/health/liveness"
echo "  curl https://api.livelify.com/health/readiness"
echo "  curl https://api.livelify.com/subscription/all"
echo ""
echo -e "${GREEN}🎉 ¡Feliz deployment!${NC}"

