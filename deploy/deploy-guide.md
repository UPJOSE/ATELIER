# GUÍA COMPLETA DE DESPLIEGUE EN MICROSOFT AZURE
## Arquitectura de Tres Capas: React (Presentación) + PHP (Aplicación) + PostgreSQL 16 (Datos)

---

## 1. Topología de Infraestructura

```
[INTERNET]
    │ HTTPS (443) / HTTP (80)
    ▼
┌────────────────────────────────────────────────────────┐
│  VM2 - Azure Linux VM (64.236.189.196)                 │
│  Subred Web / VNet Azure: 10.0.1.0/24                  │
│  IP Privada: 10.0.1.4                                  │
│  - Apache 2.4                                          │
│  - React 18 Compilado (/dist)                          │
│  - PHP 8.2 REST API (/backend/public/api)              │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ TCP Port 5432 (Red Privada)
                            │ NSG: Permitido SOLO desde 10.0.1.4
                            ▼
┌────────────────────────────────────────────────────────┐
│  VM1 - Azure Linux VM (20.25.217.22)                   │
│  Subred Datos / VNet Azure: 10.0.2.0/24                │
│  IP Privada: 10.0.2.4                                  │
│  - PostgreSQL 16 (Escucha en puerto 5432)              │
│  - Base de datos existente: 16 tablas                  │
│  - NSG Público: Puerto 5432 BLOQUEADO hacia Internet   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Configuración de Seguridad en Azure (Network Security Groups - NSG)

### Reglas para VM2 (Capa Web y Aplicación - 64.236.189.196):
| Prioridad | Nombre | Puerto | Protocolo | Origen | Destino | Acción |
|---|---|---|---|---|---|---|
| 100 | Allow-HTTP | 80 | TCP | Any / Internet | Any | Allow |
| 110 | Allow-HTTPS | 443 | TCP | Any / Internet | Any | Allow |
| 120 | Allow-SSH | 22 | TCP | Tu IP Pública | Any | Allow |

### Reglas para VM1 (Capa de Datos PostgreSQL - 20.25.217.22):
| Prioridad | Nombre | Puerto | Protocolo | Origen | Destino | Acción |
|---|---|---|---|---|---|---|
| 100 | Allow-PostgreSQL-From-VM2 | 5432 | TCP | `10.0.1.4` (o `64.236.189.196`) | Any | **Allow** |
| 110 | Allow-SSH | 22 | TCP | Tu IP Pública | Any | Allow |
| 900 | Deny-All-Inbound | Any | Any | Any | Any | **Deny** |

> [!IMPORTANT]
> Nunca exponga el puerto 5432 de PostgreSQL abiertamente a Internet (`0.0.0.0/0`). La conexión debe realizarse preferentemente a través de la IP privada de Azure dentro de la VNet.

---

## 3. Pasos de Ejecución en VM1 (Capa de Datos)

1. Conectarse vía SSH a VM1:
   ```bash
   ssh azureuser@20.25.217.22
   ```
2. Clonar el repositorio del proyecto:
   ```bash
   git clone <URL_REPOSITORIO> ~/proyecto
   cd ~/proyecto/deploy/vm1-postgresql
   ```
3. Ejecutar el script automatizado:
   ```bash
   chmod +x setup-vm1.sh
   ./setup-vm1.sh
   ```
4. Verificar que PostgreSQL está escuchando en el puerto 5432:
   ```bash
   sudo ss -tulpn | grep 5432
   ```

---

## 4. Pasos de Ejecución en VM2 (Presentación y Aplicación)

1. Conectarse vía SSH a VM2:
   ```bash
   ssh azureuser@64.236.189.196
   ```
2. Clonar el repositorio del proyecto:
   ```bash
   git clone <URL_REPOSITORIO> ~/proyecto
   cd ~/proyecto/deploy/vm2-web
   ```
3. Configurar el archivo de entorno en el backend:
   ```bash
   cp ~/proyecto/backend/.env.example ~/proyecto/backend/.env
   nano ~/proyecto/backend/.env
   ```
   *Definir `DB_HOST` con la IP privada de VM1 (ej. `10.0.2.4`) o la IP pública `20.25.217.22`.*

4. Ejecutar el script automatizado de instalación y build:
   ```bash
   chmod +x setup-vm2.sh
   ./setup-vm2.sh
   ```

---

## 5. Verificación y Pruebas de Integración de Extremo a Extremo

1. **Prueba de API PHP desde terminal en VM2**:
   ```bash
   curl -i http://localhost/api/productos
   ```
   *Debe responder HTTP 200 con el JSON de productos desde PostgreSQL.*

2. **Prueba de Carga del Frontend en el Navegador**:
   - Abrir en el navegador: `http://64.236.189.196`
   - Verificar la vitrina de productos, carrito de compras y registro de usuario.
   - Acceder al panel de administración en `http://64.236.189.196/admin` con:
     - **Correo:** `admin@tienda.com`
     - **Contraseña:** `Admin123!`
