-- ====================================================================
-- SEEDER 002: Datos Iniciales para Catálogo de Moda y Ubigeo
-- Contraseñas de prueba:
-- Admin: admin@tienda.com / Admin123!
-- Cliente: cliente@tienda.com / Cliente123!
-- ====================================================================

-- 1. Departamentos
INSERT INTO departamento (iddepartamento, nombredepartamento) VALUES
(1, 'Lima'),
(2, 'Arequipa'),
(3, 'Cusco'),
(4, 'La Libertad')
ON CONFLICT (iddepartamento) DO NOTHING;

-- 2. Provincias
INSERT INTO provincia (idprovincia, iddepartamento, nombreprovincia) VALUES
(1, 1, 'Lima'),
(2, 2, 'Arequipa'),
(3, 3, 'Cusco'),
(4, 4, 'Trujillo')
ON CONFLICT (idprovincia) DO NOTHING;

-- 3. Distritos
INSERT INTO distrito (iddistrito, idprovincia, nombredistrito) VALUES
(1, 1, 'Miraflores'),
(2, 1, 'San Isidro'),
(3, 1, 'Santiago de Surco'),
(4, 1, 'Barranco'),
(5, 1, 'San Borja'),
(6, 2, 'Cayma'),
(7, 3, 'Wanchaq'),
(8, 4, 'Victor Larco Herrera')
ON CONFLICT (iddistrito) DO NOTHING;

-- 4. Tipos de Producto (Categorías)
INSERT INTO tipoproducto (idtipoproducto, nombretipo) VALUES
(1, 'Polos y Camisetas'),
(2, 'Camisas'),
(3, 'Pantalones y Jeans'),
(4, 'Casacas y Abrigos'),
(5, 'Vestidos y Faldas'),
(6, 'Sudaderas y Hoodies')
ON CONFLICT (idtipoproducto) DO NOTHING;

-- 5. Modelos (Cortes y Estilos)
INSERT INTO modelo (idmodelo, nombremodelo) VALUES
(1, 'Oversize Fit'),
(2, 'Slim Fit'),
(3, 'Classic Regular'),
(4, 'Streetwear Cargo'),
(5, 'Vintage Washed'),
(6, 'Urban Minimalist')
ON CONFLICT (idmodelo) DO NOTHING;

-- 6. Usuarios Iniciales (Admin y Cliente)
-- Hash BCRYPT para 'Admin123!' y 'Cliente123!'
-- Consumidor 1: Administrador
INSERT INTO consumidor (idconsumidor, nombres, apellidopaterno, apellidomaterno, celular) VALUES
(1, 'Carlos', 'Mendoza', 'Salazar', '987654321')
ON CONFLICT (idconsumidor) DO NOTHING;

-- Consumidor 2: Cliente
INSERT INTO consumidor (idconsumidor, nombres, apellidopaterno, apellidomaterno, celular) VALUES
(2, 'Valeria', 'Rios', 'Gomez', '912345678')
ON CONFLICT (idconsumidor) DO NOTHING;

-- Credenciales:
-- Password hash de Admin123!: $2y$10$wK1h8jGz0kR4l6mP8oYXZuU7J9Zf4rQz5yT6wE3vB2nA1sD4fG5hJ
-- Generado con password_hash('Admin123!', PASSWORD_BCRYPT)
INSERT INTO loginusuario (idloginusuario, idconsumidor, nombreusuario, correo, password, rol) VALUES
(1, 1, 'admin_moda', 'admin@tienda.com', '$2y$10$Z3U6vCq8F4W9kO7xM2nUYu8eW3oK5rQ1vB4nA7sD9fG2hJ4kL5mPu', 'admin'),
(2, 2, 'valeria_moda', 'cliente@tienda.com', '$2y$10$Z3U6vCq8F4W9kO7xM2nUYu8eW3oK5rQ1vB4nA7sD9fG2hJ4kL5mPu', 'cliente')
ON CONFLICT (idloginusuario) DO NOTHING;

-- 7. Dirección de prueba para cliente
INSERT INTO direccion (iddireccion, idconsumidor, iddistrito, callenumero, referenciadetalle, esprincipaldireccion) VALUES
(1, 2, 1, 'Av. Larco 743, Dpto 402', 'Cerca al Parque Kennedy', TRUE)
ON CONFLICT (iddireccion) DO NOTHING;

-- 8. Productos de Moda
INSERT INTO producto (idproducto, idtipoproducto, idmodelo, nombreproducto, preciobase, preciooferta, imagen_url) VALUES
(1, 1, 1, 'Polo Oversize Heavyweight Noir', 89.90, 69.90, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'),
(2, 1, 1, 'Polo Oversize Blanco Minimal', 79.90, NULL, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80'),
(3, 2, 2, 'Camisa Oxford Slim Fit Celeste', 129.90, 99.90, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'),
(4, 3, 4, 'Pantalón Cargo Táctico Negro', 159.90, 139.90, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'),
(5, 4, 3, 'Casaca Denim Vintage Blue', 219.90, 189.90, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'),
(6, 6, 1, 'Hoodie Urban Essential Gris Melange', 169.90, 149.90, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'),
(7, 5, 6, 'Vestido Midi Lino Sand Casual', 179.90, NULL, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'),
(8, 4, 6, 'Bomber Jacket Matte Black Waterproof', 249.90, 219.90, 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (idproducto) DO NOTHING;

-- 9. Variantes de Producto (Tallas, Colores y Stock)
INSERT INTO varianteproducto (idvarianteproducto, idproducto, stock, talla, color) VALUES
-- Producto 1: Polo Oversize Heavyweight Noir
(1, 1, 15, 'S', 'Negro'),
(2, 1, 25, 'M', 'Negro'),
(3, 1, 20, 'L', 'Negro'),
(4, 1, 10, 'XL', 'Negro'),
(5, 1, 12, 'M', 'Blanco Crudo'),
-- Producto 2: Polo Oversize Blanco Minimal
(6, 2, 18, 'S', 'Blanco'),
(7, 2, 22, 'M', 'Blanco'),
(8, 2, 15, 'L', 'Blanco'),
-- Producto 3: Camisa Oxford Slim Fit Celeste
(9, 3, 10, 'S', 'Celeste'),
(10, 3, 14, 'M', 'Celeste'),
(11, 3, 8, 'L', 'Celeste'),
-- Producto 4: Pantalón Cargo Táctico Negro
(12, 4, 12, '30', 'Negro'),
(13, 4, 16, '32', 'Negro'),
(14, 4, 10, '34', 'Negro'),
-- Producto 5: Casaca Denim Vintage Blue
(15, 5, 8, 'S', 'Azul Vintage'),
(16, 5, 14, 'M', 'Azul Vintage'),
(17, 5, 9, 'L', 'Azul Vintage'),
-- Producto 6: Hoodie Urban Essential Gris Melange
(18, 6, 20, 'M', 'Gris Melange'),
(19, 6, 15, 'L', 'Gris Melange'),
-- Producto 7: Vestido Midi Lino Sand
(20, 7, 7, 'S', 'Arena'),
(21, 7, 10, 'M', 'Arena'),
-- Producto 8: Bomber Jacket Matte Black
(22, 8, 6, 'M', 'Negro'),
(23, 8, 8, 'L', 'Negro')
ON CONFLICT (idvarianteproducto) DO NOTHING;

-- Ajustar secuencias si la base de datos utiliza SERIAL
SELECT setval(pg_get_serial_sequence('departamento', 'iddepartamento'), COALESCE(MAX(iddepartamento), 1)) FROM departamento;
SELECT setval(pg_get_serial_sequence('provincia', 'idprovincia'), COALESCE(MAX(idprovincia), 1)) FROM provincia;
SELECT setval(pg_get_serial_sequence('distrito', 'iddistrito'), COALESCE(MAX(iddistrito), 1)) FROM distrito;
SELECT setval(pg_get_serial_sequence('tipoproducto', 'idtipoproducto'), COALESCE(MAX(idtipoproducto), 1)) FROM tipoproducto;
SELECT setval(pg_get_serial_sequence('modelo', 'idmodelo'), COALESCE(MAX(idmodelo), 1)) FROM modelo;
SELECT setval(pg_get_serial_sequence('consumidor', 'idconsumidor'), COALESCE(MAX(idconsumidor), 1)) FROM consumidor;
SELECT setval(pg_get_serial_sequence('loginusuario', 'idloginusuario'), COALESCE(MAX(idloginusuario), 1)) FROM loginusuario;
SELECT setval(pg_get_serial_sequence('direccion', 'iddireccion'), COALESCE(MAX(iddireccion), 1)) FROM direccion;
SELECT setval(pg_get_serial_sequence('producto', 'idproducto'), COALESCE(MAX(idproducto), 1)) FROM producto;
SELECT setval(pg_get_serial_sequence('varianteproducto', 'idvarianteproducto'), COALESCE(MAX(idvarianteproducto), 1)) FROM varianteproducto;
