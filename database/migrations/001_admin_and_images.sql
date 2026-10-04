-- ====================================================================
-- MIGRACIÓN 001: Soporte de roles de usuario y soporte de imagen de productos
-- Proyecto: Ecommerce de Moda (React + PHP + PostgreSQL 16)
-- ====================================================================

-- DOCUMENTACIÓN PREVIA:
-- 1. Se añade la columna 'rol' a la tabla existente 'loginusuario':
--    Permite clasificar usuarios entre 'cliente' y 'admin'.
--    Por defecto, cualquier nuevo registro adquiere el rol 'cliente'.
--    Los administradores tienen acceso a /admin y a endpoints de gestión.
ALTER TABLE loginusuario 
ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'cliente';

-- 2. Se añade la columna 'imagen_url' a la tabla existente 'producto':
--    Almacena el enlace o URL relativa/absoluta a la imagen de exhibición.
--    Admite hasta 500 caracteres para compatibilidad con CDN o almacenamiento Azure Blob.
ALTER TABLE producto 
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);

-- 3. Crear índice para optimizar consultas de autenticación y rol
CREATE INDEX IF NOT EXISTS idx_loginusuario_correo ON loginusuario(correo);
CREATE INDEX IF NOT EXISTS idx_loginusuario_rol ON loginusuario(rol);
CREATE INDEX IF NOT EXISTS idx_producto_tipoproducto ON producto(idtipoproducto);
CREATE INDEX IF NOT EXISTS idx_producto_modelo ON producto(idmodelo);
CREATE INDEX IF NOT EXISTS idx_varianteproducto_producto ON varianteproducto(idproducto);
CREATE INDEX IF NOT EXISTS idx_carritodetalle_carrito ON carritodetalle(idcarrito);
CREATE INDEX IF NOT EXISTS idx_ventadetalle_venta ON ventadetalle(idventa);

-- NOTA:
-- Las credenciales iniciales de administrador recomendadas son:
-- Correo: admin@tienda.com
-- Contraseña plana: Admin123!
-- El hash BCRYPT generado para esta contraseña es:
-- $2y$10$wO3o7Gz7xV8b2w/K8qYQZ.QhWn8nK1tPz1U2mJ3eK4wF5qL6v7xZa (o mediante el seeder)
