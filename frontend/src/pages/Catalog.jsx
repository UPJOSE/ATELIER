import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productosApi } from '../api/productos';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const buscar = searchParams.get('buscar') || '';
  const categoria = searchParams.get('categoria') || '';
  const modelo = searchParams.get('modelo') || '';
  const talla = searchParams.get('talla') || '';
  const color = searchParams.get('color') || '';
  const soloOfertas = searchParams.get('solo_ofertas') === '1' || searchParams.get('solo_ofertas') === 'true';
  const orden = searchParams.get('orden') || '';

  const tallasDisponibles = ['S', 'M', 'L', 'XL', '30', '32', '34'];
  const coloresDisponibles = ['Negro', 'Blanco', 'Azul', 'Celeste', 'Arena', 'Gris'];

  useEffect(() => {
    cargarFiltrosMaestros();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [searchParams]);

  const cargarFiltrosMaestros = async () => {
    try {
      const [cats, mods] = await Promise.all([
        productosApi.categorias().catch(() => []),
        productosApi.modelos().catch(() => []),
      ]);
      setCategorias(cats || []);
      setModelos(mods || []);
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosApi.listar({
        buscar,
        categoria,
        modelo,
        talla,
        color,
        solo_ofertas: soloOfertas ? 'true' : '',
        orden,
      });
      setProductos(data || []);
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const limpiarFiltros = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container page-wrapper">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Catálogo de Moda
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Prendas exclusivas, tallas y variantes con actualización en tiempo real desde PostgreSQL.
        </p>
      </div>

      <div className="catalog-layout">
        {/* Panel Lateral de Filtros */}
        <aside className="filters-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Filtros</h3>
            <button onClick={limpiarFiltros} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
              Limpiar Todo
            </button>
          </div>

          {/* Búsqueda por Texto */}
          <div className="filter-group">
            <h4 className="filter-title">Buscar</h4>
            <input
              type="text"
              placeholder="Ej. Polo, Oversize..."
              className="form-control"
              value={buscar}
              onChange={(e) => updateParam('buscar', e.target.value)}
            />
          </div>

          {/* Ofertas Especiales */}
          <div className="filter-group">
            <label className="filter-label" style={{ fontWeight: 600, color: '#e11d48' }}>
              <input
                type="checkbox"
                checked={soloOfertas}
                onChange={(e) => updateParam('solo_ofertas', e.target.checked ? '1' : '')}
              />
              Solo Productos en Oferta 🔥
            </label>
          </div>

          {/* Categoría (tipoproducto) */}
          <div className="filter-group">
            <h4 className="filter-title">Categoría</h4>
            <div className="filter-options">
              <label className="filter-label">
                <input
                  type="radio"
                  name="cat"
                  checked={!categoria}
                  onChange={() => updateParam('categoria', '')}
                />
                Todas las categorías
              </label>
              {categorias.map((cat) => (
                <label key={cat.idtipoproducto} className="filter-label">
                  <input
                    type="radio"
                    name="cat"
                    checked={categoria === String(cat.idtipoproducto)}
                    onChange={() => updateParam('categoria', String(cat.idtipoproducto))}
                  />
                  {cat.nombretipo}
                </label>
              ))}
            </div>
          </div>

          {/* Modelo / Corte */}
          <div className="filter-group">
            <h4 className="filter-title">Modelo / Corte</h4>
            <select
              className="form-control"
              value={modelo}
              onChange={(e) => updateParam('modelo', e.target.value)}
            >
              <option value="">Todos los modelos</option>
              {modelos.map((m) => (
                <option key={m.idmodelo} value={m.idmodelo}>
                  {m.nombremodelo}
                </option>
              ))}
            </select>
          </div>

          {/* Tallas */}
          <div className="filter-group">
            <h4 className="filter-title">Talla</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {tallasDisponibles.map((t) => (
                <button
                  key={t}
                  onClick={() => updateParam('talla', talla === t ? '' : t)}
                  className="btn btn-sm"
                  style={{
                    padding: '0.3rem 0.65rem',
                    background: talla === t ? '#0f172a' : '#f8fafc',
                    color: talla === t ? 'white' : '#0f172a',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Colores */}
          <div className="filter-group">
            <h4 className="filter-title">Color</h4>
            <div className="filter-options">
              {coloresDisponibles.map((col) => (
                <label key={col} className="filter-label">
                  <input
                    type="radio"
                    name="color_opt"
                    checked={color.toLowerCase() === col.toLowerCase()}
                    onChange={() => updateParam('color', color.toLowerCase() === col.toLowerCase() ? '' : col)}
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Listado Principal de Productos */}
        <main>
          {/* Barra Superior de Ordenamiento y Contador */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Mostrando <strong>{productos.length}</strong> productos
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="orden-select" style={{ fontSize: '0.85rem', color: '#64748b' }}>Ordenar por:</label>
              <select
                id="orden-select"
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.85rem' }}
                value={orden}
                onChange={(e) => updateParam('orden', e.target.value)}
              >
                <option value="">Destacados / Novedad</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nombre_asc">Nombre: A - Z</option>
                <option value="nombre_desc">Nombre: Z - A</option>
              </select>
            </div>
          </div>

          {/* Grid de Productos */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
              Consultando inventario en PostgreSQL...
            </div>
          ) : productos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '16px',
              border: '1px dashed var(--border-medium)',
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No se encontraron prendas</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                No hay productos disponibles para los filtros seleccionados. Intente restablecer los filtros de búsqueda.
              </p>
              <button onClick={limpiarFiltros} className="btn btn-primary btn-sm">
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {productos.map((prod) => (
                <ProductCard key={prod.idproducto} producto={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
