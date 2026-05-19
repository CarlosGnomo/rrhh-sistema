import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';

const card = { background: '#1a1f2e', borderRadius: 10, padding: '14px 16px', border: '0.5px solid #2a3245', marginBottom: 10 };
const finput = { width: '100%', background: '#0f1117', border: '0.5px solid #3b1d8a', borderRadius: 7, padding: '8px 11px', fontSize: 13, color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' };
const flabel = { fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' };

export default function Jefaturas() {
  const { perfil } = useAuth();
  const [honorarios, setHonorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [presupuesto, setPresupuesto] = useState(null);
  const [inputPresup, setInputPresup] = useState('');

  const areaJef = perfil?.area || 'Comercial y ventas B2B';

  useEffect(() => {
    cargarHonorarios();
    cargarPresupuesto();
  }, [areaJef]);

  async function cargarHonorarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from('honorarios')
      .select('*')
      .eq('area', areaJef)
      .order('fecha_ingreso', { ascending: false });
    if (!error) setHonorarios(data || []);
    setLoading(false);
  }

  async function cargarPresupuesto() {
    const { data } = await supabase
      .from('presupuestos')
      .select('*')
      .eq('area', areaJef)
      .eq('anio', new Date().getFullYear())
      .single();
    setPresupuesto(data);
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3500); }

  async function aprobar(id, nombre) {
    const { error } = await supabase
      .from('honorarios')
      .update({ estado: 'Aprobado' })
      .eq('id', id);
    if (!error) {
      mostrarNotif(`Honorario de ${nombre} aprobado correctamente.`);
      cargarHonorarios();
    }
  }

  async function rechazar(id) {
    const { error } = await supabase
      .from('honorarios')
      .update({ estado: 'Rechazado' })
      .eq('id', id);
    if (!error) {
      mostrarNotif('Honorario rechazado.');
      cargarHonorarios();
    }
  }

  async function guardarPresup() {
    if (!inputPresup) return;
    const monto = parseInt(inputPresup.replace(/\D/g, ''));
    const anio = new Date().getFullYear();
    if (presupuesto) {
      await supabase.from('presupuestos').update({ presupuesto_anual: monto }).eq('id', presupuesto.id);
    } else {
      await supabase.from('presupuestos').insert([{ area: areaJef, presupuesto_anual: monto, anio, actualizado_por: perfil?.correo }]);
    }
    mostrarNotif('Presupuesto actualizado correctamente.');
    setInputPresup('');
    cargarPresupuesto();
  }

  async function guardarEdit() {
    const { error } = await supabase
      .from('honorarios')
      .update(editForm)
      .eq('id', editId);
    if (!error) {
      mostrarNotif('Cambios guardados correctamente.');
      setEditId(null);
      cargarHonorarios();
    }
  }

  const pendientes = honorarios.filter(h => h.estado === 'Pendiente' || h.estado === 'En revisión');
  const totalConsumido = honorarios.filter(h => h.estado === 'Aprobado').reduce((s, h) => s + h.monto_liquido, 0);
  const presupAnual = presupuesto?.presupuesto_anual || 0;
  const disponible = presupAnual - totalConsumido;
  const pctEjecutado = presupAnual > 0 ? ((totalConsumido / presupAnual) * 100).toFixed(1) : 0;
  const estadoColor = e => ({ 'Aprobado': '#34d399', 'Pendiente': '#fbbf24', 'Rechazado': '#f87171', 'En revisión': '#60a5fa' }[e] || '#94a3b8');

  return (
    <div>
      {notif && <div style={{ background: '#1e2d1e', border: '0.5px solid #166534', borderRadius: 8, padding: '10px 14px', color: '#4ade80', fontSize: 12, marginBottom: 10 }}>{notif}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>Jefaturas</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>Panel de jefatura</span>
        </div>
        <div style={{ background: '#1a1f2e', border: '0.5px solid #2d3a5a', borderRadius: 8, padding: '8px 14px' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Área: </span>
          <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 500 }}>{areaJef}</span>
        </div>
      </div>

      {/* Presupuesto */}
      <div style={{ ...card, border: '0.5px solid #4c1d95' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#a78bfa', marginBottom: 12 }}>Control de presupuesto anual</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Presupuesto anual', value: presupAnual > 0 ? `$${presupAnual.toLocaleString('es-CL')}` : 'No ingresado', color: '#a78bfa' },
            { label: 'Consumido (aprobados)', value: `$${totalConsumido.toLocaleString('es-CL')}`, color: '#fb923c' },
            { label: 'Disponible', value: presupAnual > 0 ? `$${disponible.toLocaleString('es-CL')}` : '-', color: '#4ade80', sub: `${pctEjecutado}% ejecutado` },
          ].map(k => (
            <div key={k.label} style={{ background: '#12172a', borderRadius: 8, padding: '12px 14px', border: '0.5px solid #3b1d8a' }}>
              <div style={{ fontSize: 11, color: '#6d28d9', marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: k.color }}>{k.value}</div>
              {k.sub && <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>{k.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ ...flabel, color: '#6d28d9' }}>Ingresar / actualizar presupuesto anual ($)</label>
            <input style={finput} type="text" placeholder="Ej: 60.000.000" value={inputPresup} onChange={e => setInputPresup(e.target.value)} />
          </div>
          <button onClick={guardarPresup} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Guardar presupuesto
          </button>
        </div>
      </div>

      {/* Tabla aprobación */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span>Honorarios pendientes de aprobación</span>
          <span style={{ background: '#451a03', color: '#fbbf24', borderRadius: 999, padding: '2px 10px', fontSize: 11 }}>{pendientes.length} pendientes</span>
        </div>
        {loading ? (
          <div style={{ color: '#4a5568', fontSize: 12, padding: 20, textAlign: 'center' }}>Cargando...</div>
        ) : pendientes.length === 0 ? (
          <div style={{ color: '#4a5568', fontSize: 12, padding: 20, textAlign: 'center' }}>No hay honorarios pendientes. ✓</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 900 }}>
              <thead>
                <tr>{['Prestador','Subárea','Descripción','Monto','Banco','Tipo cuenta','N° cuenta','N° doc.','Estado','Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: '#4a5568', padding: '6px 8px', borderBottom: '0.5px solid #2a3245', fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {pendientes.map(h => (
                  <tr key={h.id}>
                    <td style={{ padding: '5px 8px', color: '#e2e8f0', fontWeight: 500, borderBottom: '0.5px solid #1a2235', whiteSpace: 'nowrap' }}>{h.nombre} {h.apellido_paterno}</td>
                    <td style={{ padding: '5px 8px', color: '#94a3b8', borderBottom: '0.5px solid #1a2235' }}>{h.subarea}</td>
                    <td style={{ padding: '5px 8px', color: '#94a3b8', borderBottom: '0.5px solid #1a2235' }}>{h.descripcion}</td>
                    <td style={{ padding: '5px 8px', color: '#4ade80', fontWeight: 500, borderBottom: '0.5px solid #1a2235' }}>${h.monto_liquido?.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '5px 8px', color: '#a78bfa', borderBottom: '0.5px solid #1a2235' }}>{h.banco}</td>
                    <td style={{ padding: '5px 8px', color: '#a78bfa', borderBottom: '0.5px solid #1a2235' }}>{h.tipo_cuenta}</td>
                    <td style={{ padding: '5px 8px', color: '#a78bfa', borderBottom: '0.5px solid #1a2235', whiteSpace: 'nowrap' }}>{h.numero_cuenta}</td>
                    <td style={{ padding: '5px 8px', color: '#64748b', borderBottom: '0.5px solid #1a2235' }}>{h.numero_documento}</td>
                    <td style={{ padding: '5px 8px', borderBottom: '0.5px solid #1a2235', whiteSpace: 'nowrap' }}>
                      <span style={{ color: estadoColor(h.estado), fontWeight: 500 }}>{h.estado}</span>
                    </td>
                    <td style={{ padding: '5px 8px', borderBottom: '0.5px solid #1a2235' }}>
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

      {/* Modal edición */}
      {editId && (
        <div style={{ background: '#12172a', border: '0.5px solid #3b1d8a', borderRadius: 12, padding: 18, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#60a5fa', marginBottom: 12 }}>Editar honorario</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={flabel}>Subárea</label><input style={finput} value={editForm.subarea || ''} onChange={e => setEditForm({ ...editForm, subarea: e.target.value })} /></div>
            <div><label style={flabel}>Descripción</label><input style={finput} value={editForm.descripcion || ''} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} /></div>
            <div><label style={flabel}>Monto líquido</label><input style={finput} value={editForm.monto_liquido || ''} onChange={e => setEditForm({ ...editForm, monto_liquido: parseInt(e.target.value) || 0 })} /></div>
            <div><label style={flabel}>N° documento</label><input style={finput} value={editForm.numero_documento || ''} onChange={e => setEditForm({ ...editForm, numero_documento: e.target.value })} /></div>
            <div>
              <label style={flabel}>Estado</label>
              <select style={finput} value={editForm.estado || 'Pendiente'} onChange={e => setEditForm({ ...editForm, estado: e.target.value })}>
                {['Pendiente','En revisión','Aprobado','Pagado'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={guardarEdit} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}>Guardar cambios</button>
            <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '0.5px solid #2a3245', borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Listado completo */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 10px' }}>
        Todos los honorarios del área ({honorarios.length})
      </div>
      <div style={{ ...card, overflowX: 'auto' }}>
        {honorarios.length === 0 ? (
          <div style={{ color: '#4a5568', fontSize: 12, padding: 20, textAlign: 'center' }}>No hay honorarios registrados para esta área.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Prestador','Subárea','Descripción','Monto','Estado','N° doc.','Fecha'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#4a5568', padding: '8px 10px', borderBottom: '0.5px solid #2a3245', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {honorarios.map((h, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#e2e8f0', fontWeight: 500, borderBottom: '0.5px solid #1e2233' }}>{h.nombre} {h.apellido_paterno}</td>
                  <td style={{ padding: '8px 10px', color: '#94a3b8', borderBottom: '0.5px solid #1e2233' }}>{h.subarea}</td>
                  <td style={{ padding: '8px 10px', color: '#94a3b8', borderBottom: '0.5px solid #1e2233' }}>{h.descripcion}</td>
                  <td style={{ padding: '8px 10px', color: '#4ade80', fontWeight: 500, borderBottom: '0.5px solid #1e2233' }}>${h.monto_liquido?.toLocaleString('es-CL')}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid #1e2233' }}><span style={{ color: estadoColor(h.estado), fontWeight: 500 }}>{h.estado}</span></td>
                  <td style={{ padding: '8px 10px', color: '#64748b', borderBottom: '0.5px solid #1e2233' }}>{h.numero_documento}</td>
                  <td style={{ padding: '8px 10px', color: '#64748b', borderBottom: '0.5px solid #1e2233', whiteSpace: 'nowrap' }}>{h.fecha_ingreso ? new Date(h.fecha_ingreso).toLocaleDateString('es-CL') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}