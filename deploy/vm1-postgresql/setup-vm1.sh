#!/bin/bash
# ====================================================================
# SCRIPT DE INSTALACIÓN Y CONFIGURACIÓN - VM1: CAPA DE DATOS (POSTGRESQL 16)
# IP Pública: 20.25.217.22 (Microsoft Azure)
# ====================================================================

set -e

echo "=== [VM1] Actualizando repositorios e instalando PostgreSQL 16 ==="
sudo apt-get update -y
sudo apt-get install -y curl ca-certificates gnupg lsb-release

# Añadir repositorio oficial de PostgreSQL
sudo install -d /etc/apt/keyrings
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg
echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

sudo apt-get update -y
sudo apt-get install -y postgresql-16 postgresql-contrib-16

echo "=== [VM1] Configurando postgresql.conf para escuchar conexiones en red privada ==="
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
PG_HBA="/etc/postgresql/16/main/pg_hba.conf"

# Escuchar en todas las interfaces de red para permitir la IP privada de Azure
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

echo "=== [VM1] Configurando pg_hba.conf para permitir acceso exclusivo de VM2 ==="
# IP Pública de VM2: 64.236.189.196 (o la IP Privada en la misma VNet, ej. 10.0.0.0/16)
# Permitir conexión con autenticación scram-sha-256 o md5
echo "# Permitir conexión desde VM2 (capas de presentación y aplicación)" | sudo tee -a "$PG_HBA"
echo "host    ecommerce_db    ecommerce_user    64.236.189.196/32       scram-sha-256" | sudo tee -a "$PG_HBA"
echo "host    ecommerce_db    ecommerce_user    10.0.0.0/16             scram-sha-256" | sudo tee -a "$PG_HBA"

echo "=== [VM1] Reiniciando servicio de PostgreSQL 16 ==="
sudo systemctl restart postgresql
sudo systemctl enable postgresql

echo "=== [VM1] Creando Base de Datos y Usuario ==="
sudo -u postgres psql <<EOF
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'ModaSecure2026!';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
\c ecommerce_db
GRANT ALL ON SCHEMA public TO ecommerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ecommerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ecommerce_user;
EOF

echo "=== [VM1] Ejecutando esquema y migración inicial ==="
# Asumiendo que el repositorio fue clonado en el servidor
sudo -u postgres psql -d ecommerce_db -f ../../database/schema_completo.sql
sudo -u postgres psql -d ecommerce_db -f ../../database/migrations/001_admin_and_images.sql
sudo -u postgres psql -d ecommerce_db -f ../../database/seeds/002_datos_iniciales.sql

echo "=== [VM1] Configuración finalizada exitosamente ==="
