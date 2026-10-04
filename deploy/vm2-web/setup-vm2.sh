#!/bin/bash
# ====================================================================
# SCRIPT DE INSTALACIÓN Y DESPLIEGUE - VM2: PRESENTACIÓN Y APLICACIÓN
# IP Pública: 64.236.189.196 (Microsoft Azure)
# Apache 2 + PHP 8.2 + Node.js (solo build frontend)
# ====================================================================

set -e

echo "=== [VM2] Actualizando repositorios del sistema ==="
sudo apt-get update -y
sudo apt-get install -y curl git ufw software-properties-common

echo "=== [VM2] Instalando Apache 2 y módulos necesarios ==="
sudo apt-get install -y apache2
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

echo "=== [VM2] Instalando PHP 8.2 y extensiones requeridas (PDO_PGSQL) ==="
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update -y
sudo apt-get install -y php8.2 php8.2-cli php8.2-common php8.2-pgsql php8.2-curl php8.2-mbstring php8.2-xml libapache2-mod-php8.2

echo "=== [VM2] Instalando Node.js (exclusivamente para construir React) ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== [VM2] Configurando estructura de directorios en /var/www/ecommerce ==="
sudo mkdir -p /var/www/ecommerce
# Copiar código del proyecto al directorio web
sudo cp -r ../../backend /var/www/ecommerce/
sudo cp -r ../../frontend /var/www/ecommerce/

echo "=== [VM2] Compilando el Frontend React con Vite ==="
cd /var/www/ecommerce/frontend
npm install
npm run build

echo "=== [VM2] Configurando VirtualHost en Apache ==="
sudo cp /var/www/ecommerce/frontend/dist/.htaccess /var/www/ecommerce/frontend/dist/.htaccess 2>/dev/null || true
sudo cp ../../deploy/vm2-web/apache-vhost.conf /etc/apache2/sites-available/ecommerce.conf
sudo a2dissite 000-default.conf
sudo a2ensite ecommerce.conf

echo "=== [VM2] Ajustando permisos de directorios ==="
sudo chown -R www-data:www-data /var/www/ecommerce
sudo chmod -R 755 /var/www/ecommerce

echo "=== [VM2] Reiniciando servicio de Apache ==="
sudo systemctl restart apache2
sudo systemctl enable apache2

echo "=== [VM2] Despliegue completado exitosamente ==="
