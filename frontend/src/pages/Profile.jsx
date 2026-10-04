import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { direccionesApi } from '../api/direcciones';
import Toast from '../components/Toast';

export default function Profile() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState({
    nombres: '',
    apellidopaterno: '',
    apellidomaterno: '',
    celular: '',
    correo: '',
    nombreusuario: '',
    rol: '',
  });

  const [direcciones, setDirecciones] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [nuevaDir, setNuevaDir] = useState({
    iddepartamento: '',
    idprovincia: '',
    iddistrito: '',
    callenumero: '',
    referenciadetalle: '',
  });

  const [mostrarFormDir, setMostrarFormDir] = useState(false);
  const [submittingPerfil, setSubmittingPerfil] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [p, d, deps] = await Promise.all([
        authApi.me(),
        direccionesApi.listar(),
        direccionesApi.departamentos(),
      ]);
      if (p) {
        setPerfil({
          nombres: p.nombres || '',
          apellidopaterno: p.apellidopaterno || '',
          apellidomaterno: p.apellidomaterno || '',
          celular: p.celular || '',
          correo: p.correo || '',
          nombreusuario: p.nombreusuario || '',
          rol: p.rol || 'cliente',
        });
      }
      setDirecciones(d || []);
      setDepartamentos(deps || []);
    } catch (err) {
      console.error('Error cargando perfil:', err);
    }
  };

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    try {
      setSubmittingPerfil(true);
      await authApi.updateProfile({
        nombres: perfil.nombres,
        apellidopaterno: perfil.apellidopaterno,
        apellidomaterno: perfil.apellidomaterno,
        celular: perfil.celular,
      });
      setToast({ message: 'Datos personales actualizados correctamente.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al actualizar perfil.', type: 'error' });
    } finally {
      setSubmittingPerfil(false);
    }
  };

  const handleDeptoChange = async (depId) => {
    setNuevaDir((prev) => ({ ...prev, iddepartamento: depId, idprovincia: '', iddistrito: '' }));
    setProvincias([]);
    setDistritos([]);
    if (depId) {
      const provs = await direccionesApi.provincias(depId);
      setProvincias(provs || []);
    }
  };

  const handleProvChange = async (provId) => {
    setNuevaDir((prev) => ({ ...prev, idprovincia: provId, iddistrito: '' }));
    setDistritos([]);
    if (provId) {
      const dists = await direccionesApi.distritos(provId);
      setDistritos(dists || []);
    }
  };

  const handleAddDireccion = async (e) => {
    e.preventDefault();
    if (!nuevaDir.iddistrito || !nuevaDir.callenumero) {
      setToast({ message: 'Complete todos los campos de ubicación.', type: 'error' });
      return;
    }

    try {
      await direccionesApi.crear({
        iddistrito: nuevaDir.iddistrito,
        callenumero: nuevaDir.callenumero,
        referenciadetalle: nuevaDir.referenciadetalle,
        esprincipaldireccion: direcciones.length === 0,
      });
      setToast({ message: 'Dirección añadida con éxito.', type: 'success' });
      setMostrarFormDir(false);
      setNuevaDir({ iddepartamento: '', idprovincia: '', iddistrito: '', callenumero: '', referenciadetalle: '' });
      const dirs = await direccionesApi.listar();
      setDirecciones(dirs);
    } catch (err) {
      setToast({ message: err.message || 'Error al agregar dirección.', type: 'error' });
    }
  };

  const handleSetPrincipal = async (id) => {
    try {
      await direccionesApi.establecerPrincipal(id);
      const dirs = await direccionesApi.listar();
      setDirecciones(dirs);
      setToast({ message: 'Dirección principal actualizada.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteDireccion = async (id) => {
    try {
      await direccionesApi.eliminar(id);
      const dirs = await direccionesApi.listar();
      setDirecciones(dirs);
      setToast({ message: 'Dirección eliminada.', type: 'info' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginBottom: '0.5rem' }}>
        Mi Cuenta y Perfil
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>
        Gestiona tu información personal y direcciones de entrega.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Formulario de Perfil (consumidor) */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👤</span> Datos Personales
          </h2>

          <form onSubmit={handleUpdatePerfil}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico (No editable)</label>
              <input type="text" className="form-control" value={perfil.correo} disabled style={{ background: '#f1f5f9' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de Usuario</label>
              <input type="text" className="form-control" value={perfil.nombreusuario} disabled style={{ background: '#f1f5f9' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Nombres</label>
              <input
                type="text"
                className="form-control"
                value={perfil.nombres}
                onChange={(e) => setPerfil({ ...perfil, nombres: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellido Paterno</label>
              <input
                type="text"
                className="form-control"
                value={perfil.apellidopaterno}
                onChange={(e) => setPerfil({ ...perfil, apellidopaterno: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellido Materno</label>
              <input
                type="text"
                className="form-control"
                value={perfil.apellidomaterno}
                onChange={(e) => setPerfil({ ...perfil, apellidomaterno: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Celular</label>
              <input
                type="tel"
                className="form-control"
                value={perfil.celular}
                onChange={(e) => setPerfil({ ...perfil, celular: e.target.value })}
              />
            </div>

            <button type="submit" disabled={submittingPerfil} className="btn btn-primary btn-block">
              {submittingPerfil ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Libreta de Direcciones (direccion, ubigeo) */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span> Direcciones de Envío
            </h2>
            <button
              onClick={() => setMostrarFormDir(!mostrarFormDir)}
              className="btn btn-secondary btn-sm"
            >
              {mostrarFormDir ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {mostrarFormDir && (
            <form onSubmit={handleAddDireccion} style={{ marginBottom: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Nueva Dirección</h3>

              <div className="form-group">
                <label className="form-label">Departamento</label>
                <select
                  className="form-control"
                  value={nuevaDir.iddepartamento}
                  onChange={(e) => handleDeptoChange(e.target.value)}
                  required
                >
                  <option value="">Seleccione</option>
                  {departamentos.map((dep) => (
                    <option key={dep.iddepartamento} value={dep.iddepartamento}>{dep.nombredepartamento}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Provincia</label>
                <select
                  className="form-control"
                  value={nuevaDir.idprovincia}
                  onChange={(e) => handleProvChange(e.target.value)}
                  disabled={!nuevaDir.iddepartamento}
                  required
                >
                  <option value="">Seleccione</option>
                  {provincias.map((p) => (
                    <option key={p.idprovincia} value={p.idprovincia}>{p.nombreprovincia}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Distrito</label>
                <select
                  className="form-control"
                  value={nuevaDir.iddistrito}
                  onChange={(e) => setNuevaDir({ ...nuevaDir, iddistrito: e.target.value })}
                  disabled={!nuevaDir.idprovincia}
                  required
                >
                  <option value="">Seleccione</option>
                  {distritos.map((dist) => (
                    <option key={dist.iddistrito} value={dist.iddistrito}>{dist.nombredistrito}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección (Calle, Av., N°)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Av. Larco 743"
                  value={nuevaDir.callenumero}
                  onChange={(e) => setNuevaDir({ ...nuevaDir, callenumero: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Referencia</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Timbre 402"
                  value={nuevaDir.referenciadetalle}
                  onChange={(e) => setNuevaDir({ ...nuevaDir, referenciadetalle: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm btn-block">Guardar Dirección</button>
            </form>
          )}

          {direcciones.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No tienes direcciones registradas aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {direcciones.map((dir) => (
                <div
                  key={dir.iddireccion}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: dir.esprincipaldireccion ? '2px solid #2563eb' : '1px solid var(--border-light)',
                    background: dir.esprincipaldireccion ? '#eff6ff' : '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dir.callenumero}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {dir.nombredistrito}, {dir.nombreprovincia} ({dir.nombredepartamento})
                      </div>
                      {dir.referenciadetalle && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Ref: {dir.referenciadetalle}
                        </div>
                      )}
                    </div>
                    {dir.esprincipaldireccion && (
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Principal</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {!dir.esprincipaldireccion && (
                      <button
                        onClick={() => handleSetPrincipal(dir.iddireccion)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Hacer Principal
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDireccion(dir.iddireccion)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
