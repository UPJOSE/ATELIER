# ECOMMERCE DE MODA — ARQUITECTURA DE TRES CAPAS
## React + PHP REST API + PostgreSQL 16
### Proyecto Académico de Sistemas Operativos — Universidad Peruana de Ciencias Aplicadas (UPC)

---

## 1. DESCRIPCIÓN GENERAL

Este proyecto implementa una solución completa de comercio electrónico para una tienda de moda contemporánea (**ATELIER**), utilizando una arquitectura distribuida de tres capas físicamente desacopladas:

1. **Capa de Presentación:** Interfaz de usuario interactiva construida con **React 18 + Vite** (Single Page Application).
2. **Capa de Aplicación:** API REST desacoplada desarrollada en **PHP 8.x** con PDO, autenticación basada en sesiones y autorización por roles (RBAC).
3. **Capa de Datos:** Motor relacional **PostgreSQL 16** con un esquema estricto de 16 tablas existentes.

---

## 2. INFRAESTRUCTURA DE DESPLIEGUE EN MICROSOFT AZURE

La aplicación está preparada y configurada para distribuirse en dos máquinas virtuales Linux en Azure:

* **VM1 (Capa de Datos):**
  * **IP Pública de Contingencia:** `20.25.217.22`
  * **IP Privada de Azure (VNet):** `10.0.2.4` (Ejemplo de subred privada)
  * **Servicio:** PostgreSQL 16 escuchando en puerto `5432`.
  * **Seguridad:** El Grupo de Seguridad de Red (NSG) bloquea el puerto 5432 hacia Internet y únicamente admite tráfico originado desde la IP de VM2.

* **VM2 (Capa de Presentación y Aplicación):**
  * **IP Pública:** `64.236.189.196`
  * **IP Privada de Azure (VNet):** `10.0.1.4`
  * **Servicios:** Servidor Web Apache 2.4 + PHP 8.2 + React Compilado en `/dist`.
  * **Enrutamiento:** Apache sirve la SPA en la raíz `/` y redirige las llamadas `/api/*` hacia el script despachador `backend/public/api/index.php`.

```
USUARIO (Navegador)
       │ HTTPS / HTTP
       ▼
   VM2 (Apache 2.4 - 64.236.189.196)
   ├── React SPA (/dist) [Presentación]
   └── PHP REST API (/backend/public/api) [Aplicación]
       │ SQL / PDO_PGSQL (Red Privada Azure)
       ▼
   VM1 (PostgreSQL 16 - 20.25.217.22 / 10.0.2.4) [Datos]
   └── Base de datos: 16 tablas relacionales
```

> **IMPORTANTE:** React NUNCA se conecta directamente a PostgreSQL. Toda interacción transita obligatoriamente a través de PHP.

---

## 3. ESQUEMA DE BASE DE DATOS Y MIGRACIÓN

El sistema opera sobre las **16 tablas existentes**:

1. `departamento`
2. `provincia`
3. `distrito`
4. `consumidor`
5. `loginusuario`
6. `direccion`
7. `metodopago`
8. `modelo`
9. `tipoproducto`
10. `producto`
11. `varianteproducto`
12. `carritocompras`
13. `carritodetalle`
14. `venta`
15. `ventadetalle`
16. `comprobantepago`

### Migración 001 (`database/migrations/001_admin_and_images.sql`)
1. **Roles RBAC:** Se agrega `rol VARCHAR(20) NOT NULL DEFAULT 'cliente'` a `loginusuario` para admitir perfiles `cliente` y `admin`.
2. **Fotografía de Moda:** Se agrega `imagen_url VARCHAR(500)` a `producto` para soportar URLs de imágenes de alta resolución.

### Datos de Prueba Iniciales (`database/seeds/002_datos_iniciales.sql`)
* **Administrador:**
  * Correo: `admin@tienda.com`
  * Contraseña: `Admin123!`
* **Cliente:**
  * Correo: `cliente@tienda.com`
  * Contraseña: `Cliente123!`

---

## 4. ESTRUCTURA DEL PROYECTO

```
.
├── backend/
│   ├── config/
│   │   ├── database.php          # Conexión PDO PostgreSQL con soporte para .env
│   │   └── cors.php              # Headers CORS y configuración de sesiones
│   ├── helpers/
│   │   └── Response.php          # Utilitario para respuestas JSON uniformes
│   ├── middleware/
│   │   ├── auth.php              # Autenticación de sesiones y Bearer tokens
│   │   └── admin.php             # Autorización para rol 'admin' (HTTP 403)
│   ├── models/
│   │   ├── Usuario.php           # consumidor + loginusuario
│   │   ├── Producto.php          # producto + tipoproducto + modelo
│   │   ├── VarianteProducto.php  # varianteproducto (tallas, colores, stock)
│   │   ├── Categoria.php         # tipoproducto + modelo
│   │   ├── Carrito.php           # carritocompras + carritodetalle
│   │   ├── Venta.php             # venta + ventadetalle + comprobantepago
│   │   └── Direccion.php         # direccion + distrito + provincia + depto
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── ProductoController.php
│   │   ├── CategoriaController.php
│   │   ├── CarritoController.php
│   │   ├── VentaController.php
│   │   ├── DireccionController.php
│   │   └── AdminController.php
│   ├── public/
│   │   └── api/
│   │       └── index.php         # Enrutador central REST API
│   └── .env.example
├── database/
│   ├── migrations/
│   │   └── 001_admin_and_images.sql
│   ├── schema_completo.sql
│   └── seeds/
│       └── 002_datos_iniciales.sql
├── deploy/
│   ├── vm1-postgresql/
│   │   └── setup-vm1.sh          # Automatización de instalación en VM1
│   ├── vm2-web/
│   │   ├── apache-vhost.conf     # VirtualHost Apache con mod_rewrite
│   │   ├── .htaccess             # Soporte SPA y /api
│   │   └── setup-vm2.sh          # Automatización de Apache + PHP + React build
│   └── deploy-guide.md           # Guía paso a paso en Azure
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/                  # Servicios de comunicación HTTP
        ├── components/           # Navbar, Footer, ProductCard, Toast, etc.
        ├── context/              # AuthContext y CartContext
        └── pages/                # Catálogo, Detalle, Carrito, Admin, etc.
```

---

## 5. GUÍA RÁPIDA DE EJECUCIÓN LOCAL

### 1. Backend (PHP):
En la raíz del proyecto, inicie el servidor de desarrollo PHP:
```bash
php -S localhost:8000 -t backend/public
```

### 2. Frontend (React):
```bash
cd frontend
npm install
npm run dev
```
Acceda a `http://localhost:5173`. Las llamadas a `/api` se enviarán mediante el proxy de Vite a PHP.

---

## 6. GUÍA DE DESPLIEGUE EN VM1 Y VM2 (AZURE)

Consulte el manual detallado en:
[`deploy/deploy-guide.md`](file:///c:/Users/amaro/Documents/UPC/Sistemas%20Operativos/Proyecto/deploy/deploy-guide.md).
