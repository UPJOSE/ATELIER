-- ====================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS - POSTGRESQL 16
-- Proyecto: Ecommerce de Moda (React + PHP + PostgreSQL)
-- 16 Tablas exactas requeridas + Migración 001
-- ====================================================================

-- 1. Departamento
CREATE TABLE IF NOT EXISTS departamento (
    iddepartamento SERIAL PRIMARY KEY,
    nombredepartamento VARCHAR(100) NOT NULL
);

-- 2. Provincia
CREATE TABLE IF NOT EXISTS provincia (
    idprovincia SERIAL PRIMARY KEY,
    iddepartamento INTEGER NOT NULL REFERENCES departamento(iddepartamento),
    nombreprovincia VARCHAR(100) NOT NULL
);

-- 3. Distrito
CREATE TABLE IF NOT EXISTS distrito (
    iddistrito SERIAL PRIMARY KEY,
    idprovincia INTEGER NOT NULL REFERENCES provincia(idprovincia),
    nombredistrito VARCHAR(100) NOT NULL
);

-- 4. Consumidor
CREATE TABLE IF NOT EXISTS consumidor (
    idconsumidor SERIAL PRIMARY KEY,
    nombres VARCHAR(50) NOT NULL,
    apellidopaterno VARCHAR(50) NOT NULL,
    apellidomaterno VARCHAR(50) NOT NULL,
    celular VARCHAR(15)
);

-- 5. Loginusuario
CREATE TABLE IF NOT EXISTS loginusuario (
    idloginusuario SERIAL PRIMARY KEY,
    idconsumidor INTEGER UNIQUE NOT NULL REFERENCES consumidor(idconsumidor) ON DELETE CASCADE,
    nombreusuario VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente' -- Agregado por migración 001
);

-- 6. Direccion
CREATE TABLE IF NOT EXISTS direccion (
    iddireccion SERIAL PRIMARY KEY,
    idconsumidor INTEGER NOT NULL REFERENCES consumidor(idconsumidor) ON DELETE CASCADE,
    iddistrito INTEGER NOT NULL REFERENCES distrito(iddistrito),
    callenumero VARCHAR(150) NOT NULL,
    referenciadetalle VARCHAR(200),
    esprincipaldireccion BOOLEAN DEFAULT FALSE
);

-- 7. Metodo de Pago
CREATE TABLE IF NOT EXISTS metodopago (
    idmetodopago SERIAL PRIMARY KEY,
    idconsumidor INTEGER NOT NULL REFERENCES consumidor(idconsumidor) ON DELETE CASCADE,
    tipometodopago VARCHAR(30) NOT NULL,
    bancoemisor VARCHAR(100),
    numeroenmascarado VARCHAR(20) NOT NULL,
    nombretitular VARCHAR(100) NOT NULL,
    esprincipalmetodo BOOLEAN DEFAULT FALSE
);

-- 8. Modelo
CREATE TABLE IF NOT EXISTS modelo (
    idmodelo SERIAL PRIMARY KEY,
    nombremodelo VARCHAR(50) UNIQUE NOT NULL
);

-- 9. Tipo de Producto (Categorías)
CREATE TABLE IF NOT EXISTS tipoproducto (
    idtipoproducto SERIAL PRIMARY KEY,
    nombretipo VARCHAR(50) UNIQUE NOT NULL
);

-- 10. Producto
CREATE TABLE IF NOT EXISTS producto (
    idproducto SERIAL PRIMARY KEY,
    idtipoproducto INTEGER NOT NULL REFERENCES tipoproducto(idtipoproducto),
    idmodelo INTEGER NOT NULL REFERENCES modelo(idmodelo),
    nombreproducto VARCHAR(150) NOT NULL,
    preciobase NUMERIC(10, 2) NOT NULL,
    preciooferta NUMERIC(10, 2),
    imagen_url VARCHAR(500) -- Agregado por migración 001
);

-- 11. Variante de Producto (Talla, Color, Stock)
CREATE TABLE IF NOT EXISTS varianteproducto (
    idvarianteproducto SERIAL PRIMARY KEY,
    idproducto INTEGER NOT NULL REFERENCES producto(idproducto) ON DELETE CASCADE,
    stock INTEGER NOT NULL DEFAULT 0,
    talla VARCHAR(10) NOT NULL,
    color VARCHAR(30) NOT NULL
);

-- 12. Carrito de Compras
CREATE TABLE IF NOT EXISTS carritocompras (
    idcarritocompras SERIAL PRIMARY KEY,
    idconsumidor INTEGER UNIQUE NOT NULL REFERENCES consumidor(idconsumidor) ON DELETE CASCADE,
    fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Carrito Detalle
CREATE TABLE IF NOT EXISTS carritodetalle (
    idcarritodetalle SERIAL PRIMARY KEY,
    idcarrito INTEGER NOT NULL REFERENCES carritocompras(idcarritocompras) ON DELETE CASCADE,
    idinventario INTEGER NOT NULL REFERENCES varianteproducto(idvarianteproducto) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1
);

-- 14. Venta
CREATE TABLE IF NOT EXISTS venta (
    idventa SERIAL PRIMARY KEY,
    idconsumidor INTEGER NOT NULL REFERENCES consumidor(idconsumidor),
    estadoventa VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    montototal NUMERIC(10, 2) NOT NULL,
    fechaventa TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Venta Detalle
CREATE TABLE IF NOT EXISTS ventadetalle (
    idventadetalle SERIAL PRIMARY KEY,
    idventa INTEGER NOT NULL REFERENCES venta(idventa) ON DELETE CASCADE,
    idinventario INTEGER NOT NULL REFERENCES varianteproducto(idvarianteproducto),
    cantidadproductos INTEGER NOT NULL
);

-- 16. Comprobante de Pago
CREATE TABLE IF NOT EXISTS comprobantepago (
    idcomprobante SERIAL PRIMARY KEY,
    idventa INTEGER UNIQUE NOT NULL REFERENCES venta(idventa) ON DELETE CASCADE,
    tipocomprobante VARCHAR(20) NOT NULL,
    numcomprobante VARCHAR(30) UNIQUE NOT NULL,
    montopagado NUMERIC(10, 2) NOT NULL,
    fechaemision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
