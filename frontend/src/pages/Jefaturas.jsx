import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';

const AREAS = ['Comercial y ventas B2B','Ventas en tienda','Marketing','Diseño y vestuario','Diseño gráfico','Administración y finanzas','Bodega'];

const VERDE       = '#4a5e2a';
const VERDE_CLARO = '#f0f4e8';
const FONDO       = '#eef2e6';
const BORDE       = '#c8d5a8';
const TEXTO_EXT   = '#4a5568';

const card = {
  background: '#fff',
  borderRadius: 10,
  padding: '14px 16px',
  border: '1px solid ' + BORDE,
  marginBottom: 10,
};
const finput = {
  width: '100%',
  background: '#f9fbf5',
  border: '1px solid ' + BORDE,
  borderRadius: 7,
  padding: '8px 11px',
  fontSize: 13,
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
};
const flabel = { fontSize: 11, color: '#555', marginBottom: 5, display: 'block' };
const secTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: '#fff',
  background: VERDE,
  margin: '0 0 14px',
  padding: '8px 14px',
  borderRadius: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

export default function Jefaturas() {
  const { perfil } = useAuth();
  const [areaSeleccionada, setAreaSeleccionada] = useState('Ventas en tienda');
  const [honorarios, setHonorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [presupuesto, setPresupuesto] = useState(null);
  const [inputPresup, setInputPresup] = useState('');
  const [perfilListo, setPerfilListo] = useState(false);

  useEffect(() => {
    if (perfil) {
      if (perfil.rol !== 'admin' && perfil.area) setAreaSeleccionada(perfil.area);
      setPerfilListo(true);
    }
  }, [perfil]);

  useEffect(() => {
    if (perfilListo) { cargarHonorarios(); cargarPresupuesto(); }
  }, [areaSeleccionada, perfilListo]);

  async function cargarHonorarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from('honorarios').select('*')
      .eq('area', areaSeleccionada)
      .order('fecha_ingreso', { ascending: false });
    if (!error) setHonorarios(data || []);
    setLoading(false);
  }

  async function cargarPresupuesto() {
    const { data } = await supabase.from('presupuestos').select('*')
      .eq('area', areaSeleccionada).eq('anio', new Date().getFullYear()).single();
    setPresupuesto(data);
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3500); }

  async function aprobar(id, nombre) {
    const { error } = await supabase.from('honorarios').update({ estado: 'Aprobado' }).eq('id', id);
    if (!error) { mostrarNotif(`Honorario de ${nombre} aprobado.`); cargarHonorarios(); }
  }

  async function rechazar(id) {
    const { error } = await supabase.from('honorarios').update({ estado: 'Rechazado' }).eq('id', id);
    if (!error) { mostrarNotif('Honorario rechazado.'); cargarHonorarios(); }
  }

  async function reabrir(id) {
    const { error } = await supabase.from('honorarios').update({ estado: 'Pendiente' }).eq('id', id);
    if (!error) { mostrarNotif('Honorario reabierto. Volvio a Pendiente.'); cargarHonorarios(); }
  }

  async function guardarPresup() {
    if (!inputPresup) return;
    const monto = parseInt(inputPresup.replace(/\D/g, ''));
    const anio = new Date().getFullYear();
    if (presupuesto) {
      await supabase.from('presupuestos').update({ presupuesto_anual: monto }).eq('id', presupuesto.id);
    } else {
      await supabase.from('presupuestos').insert([{ area: areaSeleccionada, presupuesto_anual: monto, anio, actualizado_por: perfil?.correo }]);
    }
    mostrarNotif('Presupuesto actualizado.');
    setInputPresup('');
    cargarPresupuesto();
  }

  async function guardarEdit() {
    const { error } = await supabase.from('honorarios').update(editForm).eq('id', editId);
    if (!error) { mostrarNotif('Cambios guardados.'); setEditId(null); cargarHonorarios(); }
  }

  const pendientes = honorarios.filter(h => h.estado === 'Pendiente' || h.estado === 'En revisión');
  const totalConsumido = honorarios.filter(h => h.estado === 'Aprobado').reduce((s, h) => s + h.monto_liquido, 0);
  const presupAnual = presupuesto?.presupuesto_anual || 0;
  const disponible = presupAnual - totalConsumido;
  const pctEjecutado = presupAnual > 0 ? ((totalConsumido / presupAnual) * 100).toFixed(1) : 0;
  const esAdmin = perfil?.rol === 'admin';

  const estadoColor = e => ({
    'Aprobado':    '#16a34a',
    'Pendiente':   '#d97706',
    'Rechazado':   '#dc2626',
    'En revisión': '#2563eb'
  }[e] || '#94a3b8');

  return (
    // Wrapper que fuerza el fondo verde sobre el Layout oscuro
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: FONDO, zIndex: 0, pointerEvents: 'none'
    }}>
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'all' }} />
    </div>,
    <div style={{
      background: FONDO,
      minHeight: 'calc(100vh - 60px)',
      margin: '-20px',
      padding: '20px',
    }}>

      {/* Notificacion */}
      {notif && (
        <div style={{ background: '#edfaf1', border: '1px solid #a7d7b0', borderRadius: 8, padding: '10px 14px', color: VERDE, fontSize: 12, marginBottom: 10, fontWeight: 500 }}>
          {notif}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: VERDE, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Jefaturas</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: TEXTO_EXT }}>Panel de jefatura</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: TEXTO_EXT }}>Area: </span>
          {esAdmin ? (
            <select value={areaSeleccionada} onChange={e => setAreaSeleccionada(e.target.value)}
              style={{ background: '#f9fbf5', border: '1px solid ' + BORDE, borderRadius: 6, padding: '4px 10px', fontSize: 13, color: VERDE, outline: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          ) : (
            <span style={{ fontSize: 13, color: VERDE, fontWeight: 600 }}>{areaSeleccionada}</span>
          )}
        </div>
      </div>

      {/* Card presupuesto */}
      <div style={{ ...card, border: '1px solid ' + BORDE, background: VERDE_CLARO }}>
        <div style={secTitle}>Control de presupuesto anual</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: esAdmin ? 14 : 0 }}>
          {[
            { label: 'Presupuesto anual',     value: presupAnual > 0 ? `$${presupAnual.toLocaleString('es-CL')}` : 'No ingresado', color: VERDE },
            { label: 'Consumido (aprobados)', value: `$${totalConsumido.toLocaleString('es-CL')}`, color: '#c0392b' },
            { label: 'Disponible',            value: presupAnual > 0 ? `$${disponible.toLocaleString('es-CL')}` : '-', color: '#2e7d32', sub: `${pctEjecutado}% ejecutado` },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid ' + BORDE }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: k.color }}>{k.value}</div>
              {k.sub && <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{k.sub}</div>}
            </div>
          ))}
        </div>
        {esAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ ...flabel, color: VERDE }}>Ingresar / actualizar presupuesto anual ($)</label>
              <input style={finput} type="text" placeholder="Ej: 60.000.000" value={inputPresup} onChange={e => setInputPresup(e.target.value)} />
            </div>
            <button onClick={guardarPresup} style={{ background: VERDE, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Guardar presupuesto
            </button>
          </div>
        )}
      </div>

      {/* Honorarios pendientes */}
      <div style={card}>
        <div style={{ ...secTitle, marginBottom: 12 }}>
          Honorarios pendientes de aprobacion
          <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 999, padding: '2px 10px', fontSize: 11, marginLeft: 10, fontWeight: 700 }}>
            {pendientes.length} pendientes
          </span>
        </div>
        {loading ? (
          <div style={{ color: TEXTO_EXT, fontSize: 12, padding: 20, textAlign: 'center' }}>Cargando...</div>
        ) : pendientes.length === 0 ? (
          <div style={{ color: TEXTO_EXT, fontSize: 12, padding: 20, textAlign: 'center' }}>No hay honorarios pendientes. ✓</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 900 }}>
              <thead>
                <tr>{['Prestador','Subarea','Descripcion','Monto','Banco','Tipo cuenta','N° cuenta','N° doc.','Estado','Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: TEXTO_EXT, padding: '6px 8px', borderBottom: '1px solid ' + BORDE, fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {pendientes.map(h => (
                  <tr key={h.id}>
                    <td style={{ padding: '5px 8px', color: '#1a1a1a', fontWeight: 500, borderBottom: '1px solid ' + BORDE, whiteSpace: 'nowrap' }}>{h.nombre} {h.apellido_paterno}</td>
                    <td style={{ padding: '5px 8px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.subarea}</td>
                    <td style={{ padding: '5px 8px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.descripcion}</td>
                    <td style={{ padding: '5px 8px', color: VERDE, fontWeight: 600, borderBottom: '1px solid ' + BORDE }}>${h.monto_liquido?.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '5px 8px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.banco}</td>
                    <td style={{ padding: '5px 8px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.tipo_cuenta}</td>
                    <td style={{ padding: '5px 8px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE, whiteSpace: 'nowrap' }}>{h.numero_cuenta}</td>
                    <td style={{ padding: '5px 8px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.numero_documento}</td>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid ' + BORDE, whiteSpace: 'nowrap' }}>
                      <span style={{ color: estadoColor(h.estado), fontWeight: 700 }}>{h.estado}</span>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid ' + BORDE }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => aprobar(h.id, h.nombre)} style={{ background: '#14532d', color: '#4ade80', border: '0.5px solid #166534', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>✓ Aprobar</button>
                        <button onClick={() => { setEditId(h.id); setEditForm({ subarea: h.subarea, descripcion: h.descripcion, monto_liquido: h.monto_liquido, numero_documento: h.numero_documento, estado: h.estado }); }} style={{ background: '#1e3a5f', color: '#60a5fa', border: '0.5px solid #1d4ed8', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => rechazar(h.id)} style={{ background: '#450a0a', color: '#f87171', border: '0.5px solid #7f1d1d', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel edicion */}
      {editId && (
        <div style={{ background: VERDE_CLARO, border: '1px solid ' + BORDE, borderRadius: 12, padding: 18, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: VERDE, marginBottom: 12 }}>Editar honorario</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={flabel}>Subarea</label><input style={finput} value={editForm.subarea || ''} onChange={e => setEditForm({ ...editForm, subarea: e.target.value })} /></div>
            <div><label style={flabel}>Descripcion</label><input style={finput} value={editForm.descripcion || ''} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} /></div>
            <div><label style={flabel}>Monto liquido</label><input style={finput} value={editForm.monto_liquido || ''} onChange={e => setEditForm({ ...editForm, monto_liquido: parseInt(e.target.value) || 0 })} /></div>
            <div><label style={flabel}>N° documento</label><input style={finput} value={editForm.numero_documento || ''} onChange={e => setEditForm({ ...editForm, numero_documento: e.target.value })} /></div>
            <div>
              <label style={flabel}>Estado</label>
              <select style={finput} value={editForm.estado || 'Pendiente'} onChange={e => setEditForm({ ...editForm, estado: e.target.value })}>
                {['Pendiente','En revision','Aprobado','Pagado'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={guardarEdit} style={{ background: VERDE, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Guardar cambios</button>
            <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '1px solid ' + BORDE, borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#555', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Todos los honorarios */}
      <div style={{ fontSize: 11, fontWeight: 600, color: TEXTO_EXT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 10px' }}>
        Todos los honorarios del area ({honorarios.length})
      </div>
      <div style={{ ...card, overflowX: 'auto' }}>
        {honorarios.length === 0 ? (
          <div style={{ color: TEXTO_EXT, fontSize: 12, padding: 20, textAlign: 'center' }}>No hay honorarios registrados para esta area.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Prestador','Subarea','Descripcion','Monto','Estado','N° doc.','Fecha',''].map(h => (
                <th key={h} style={{ textAlign: 'left', color: TEXTO_EXT, padding: '8px 10px', borderBottom: '1px solid ' + BORDE, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {honorarios.map((h, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#1a1a1a', fontWeight: 500, borderBottom: '1px solid ' + BORDE }}>{h.nombre} {h.apellido_paterno}</td>
                  <td style={{ padding: '8px 10px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.subarea}</td>
                  <td style={{ padding: '8px 10px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.descripcion}</td>
                  <td style={{ padding: '8px 10px', color: VERDE, fontWeight: 600, borderBottom: '1px solid ' + BORDE }}>${h.monto_liquido?.toLocaleString('es-CL')}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE }}>
                    <span style={{ color: estadoColor(h.estado), fontWeight: 700 }}>{h.estado}</span>
                  </td>
                  <td style={{ padding: '8px 10px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE }}>{h.numero_documento}</td>
                  <td style={{ padding: '8px 10px', color: TEXTO_EXT, borderBottom: '1px solid ' + BORDE, whiteSpace: 'nowrap' }}>{h.fecha_ingreso ? new Date(h.fecha_ingreso).toLocaleDateString('es-CL') : '-'}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE }}>
                    {h.estado === 'Rechazado' && (
                      <button onClick={() => reabrir(h.id)} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                        ↺ Reabrir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}