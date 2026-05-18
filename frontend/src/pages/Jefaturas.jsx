import { useState } from 'react';

const card = { background: '#1a1f2e', borderRadius: 10, padding: '14px 16px', border: '0.5px solid #2a3245', marginBottom: 10 };
const finput = { width: '100%', background: '#0f1117', border: '0.5px solid #3b1d8a', borderRadius: 7, padding: '8px 11px', fontSize: 13, color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' };
const flabel = { fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' };

const honorariosPendientes = [
  { id: 'a1', nombre: 'Jorge Herrera M.', subarea: 'B2B Norte', descripcion: 'Asesoría ventas', presupuesto: '$5.000.000', monto: '$1.200.000', banco: 'Banco Chile', tipoCuenta: 'Cta. corriente', numCuenta: '00-123-45678-9', doc: 'BOL-003', estado: 'Pendiente' },
  { id: 'a2', nombre: 'Ana Torres F.', subarea: 'Capacitación', descripcion: 'Formación interna', presupuesto: '$2.000.000', monto: '$850.000', banco: 'BancoEstado', tipoCuenta: 'Cta. vista', numCuenta: '00-987-65432-1', doc: 'BOL-004', estado: 'Pendiente' },
  { id: 'a3', nombre: 'Rodrigo Vega P.', subarea: 'Colección', descripcion: 'Diseño temporada', presupuesto: '$4.500.000', monto: '$1.800.000', banco: 'Santander', tipoCuenta: 'Cta. corriente', numCuenta: '00-456-78901-2', doc: 'BOL-005', estado: 'En revisión' },
];

export default function Jefaturas() {
  const [area, setArea] = useState('Comercial y ventas B2B');
  const [presupuesto, setPresupuesto] = useState('$60.000.000');
  const [inputPresup, setInputPresup] = useState('');
  const [estados, setEstados] = useState({ a1: 'Pendiente', a2: 'Pendiente', a3: 'En revisión' });
  const [notif, setNotif] = useState('');
  const [editId, setEditId] = useState(null);

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3500); }
  function aprobar(id, nombre) { setEstados(p => ({ ...p, [id]: 'Aprobado' })); mostrarNotif(`Honorario de ${nombre} aprobado correctamente.`); }
  function rechazar(id) { setEstados(p => ({ ...p, [id]: 'Rechazado' })); mostrarNotif('Honorario rechazado.'); }
  function guardarPresup() { if (!inputPresup) return; setPresupuesto('$' + inputPresup); mostrarNotif('Presupuesto actualizado a $' + inputPresup); setInputPresup(''); }

  const estadoColor = e => ({ 'Aprobado': '#34d399', 'Pendiente': '#fbbf24', 'Rechazado': '#f87171', 'En revisión': '#60a5fa' }[e] || '#94a3b8');

  const progresoBars = [
    { label: 'Tienda Foster Santiago', consumido: '$3.2M', total: '$5M', pct: 64, color: '#fb923c' },
    { label: 'Tienda Casa Costanera', consumido: '$4.1M', total: '$4.5M', pct: 91, color: '#f87171' },
    { label: 'Tienda Chillán', consumido: '$1.8M', total: '$4M', pct: 45, color: '#34d399' },
  ];

  return (
    <div>
      {notif && <div style={{ background: '#1e2d1e', border: '0.5px solid #166534', borderRadius: 8, padding: '10px 14px', color: '#4ade80', fontSize: 12, marginBottom: 10 }}>{notif}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>Jefaturas</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>Panel de jefatura</span>
        </div>
        <div style={{ background: '#1a1f2e', border: '0.5px solid #2d3a5a', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Área responsable:</span>
          <select value={area} onChange={e => setArea(e.target.value)} style={{ background: '#0f1117', border: '0.5px solid #2a3245', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#a78bfa', outline: 'none', cursor: 'pointer' }}>
            {['Comercial y ventas B2B','Ventas en tienda','Marketing','Diseño y vestuario','Administración y finanzas','Bodega'].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Presupuesto */}
      <div style={{ ...card, border: '0.5px solid #4c1d95' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#a78bfa', marginBottom: 12 }}>Ingreso y control de presupuesto anual</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Presupuesto anual', value: presupuesto, color: '#a78bfa' },
            { label: 'Consumido a la fecha', value: '$18.750.000', color: '#fb923c' },
            { label: 'Disponible', value: '$41.250.000', color: '#4ade80' },
          ].map(k => (
            <div key={k.label} style={{ background: '#12172a', borderRadius: 8, padding: '12px 14px', border: '0.5px solid #3b1d8a' }}>
              <div style={{ fontSize: 11, color: '#6d28d9', marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ ...flabel, color: '#6d28d9' }}>Actualizar presupuesto anual ($)</label>
            <input style={finput} type="text" placeholder="Ej: 60.000.000" value={inputPresup} onChange={e => setInputPresup(e.target.value)} />
          </div>
          <button onClick={guardarPresup} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Guardar presupuesto
          </button>
        </div>
      </div>

      {/* Barras de progreso */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 12 }}>Porcentaje de consumo del presupuesto por subárea</div>
        {progresoBars.map(b => (
          <div key={b.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              <span>{b.label}</span>
              <span style={{ color: b.color }}>{b.consumido} / {b.total} · <strong>{b.pct} porcentaje</strong></span>
            </div>
            <div style={{ height: 16, background: '#1e2233', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{b.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla aprobación */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span>Honorarios en espera de aprobación</span>
          <span style={{ background: '#451a03', color: '#fbbf24', borderRadius: 999, padding: '2px 10px', fontSize: 11 }}>
            {Object.values(estados).filter(e => e === 'Pendiente' || e === 'En revisión').length} pendientes
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 900 }}>
            <thead>
              <tr>{['Prestador','Subárea','Descripción','Presupuesto','Monto','Banco','Tipo cuenta','N° cuenta','N° doc.','Estado','Acciones'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#4a5568', padding: '6px 8px', borderBottom: '0.5px solid #2a3245', fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {honorariosPendientes.map(h => (
                <tr key={h.id}>
                  <td style={{ padding: '5px 8px', color: '#e2e8f0', fontWeight: 500, borderBottom: '0.5px solid #1a2235', whiteSpace: 'nowrap' }}>{h.nombre}</td>
                  <td style={{ padding: '5px 8px', color: '#94a3b8', borderBottom: '0.5px solid #1a2235' }}>{h.subarea}</td>
                  <td style={{ padding: '5px 8px', color: '#94a3b8', borderBottom: '0.5px solid #1a2235' }}>{h.descripcion}</td>
                  <td style={{ padding: '5px 8px', color: '#6d28d9', borderBottom: '0.5px solid #1a2235' }}>{h.presupuesto}</td>
                  <td style={{ padding: '5px 8px', color: '#4ade80', fontWeight: 500, borderBottom: '0.5px solid #1a2235' }}>{h.monto}</td>
                  <td style={{ padding: '5px 8px', color: '#a78bfa', borderBottom: '0.5px solid #1a2235' }}>{h.banco}</td>
                  <td style={{ padding: '5px 8px', color: '#a78bfa', borderBottom: '0.5px solid #1a2235' }}>{h.tipoCuenta}</td>
                  <td style={{ padding: '5px 8px', color: '#a78bfa', borderBottom: '0.5px solid #1a2235', whiteSpace: 'nowrap' }}>{h.numCuenta}</td>
                  <td style={{ padding: '5px 8px', color: '#64748b', borderBottom: '0.5px solid #1a2235' }}>{h.doc}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '0.5px solid #1a2235', whiteSpace: 'nowrap' }}>
                    <span style={{ color: estadoColor(estados[h.id]), fontWeight: 500 }}>{estados[h.id]}</span>
                  </td>
                  <td style={{ padding: '5px 8px', borderBottom: '0.5px solid #1a2235' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => aprobar(h.id, h.nombre)} style={{ background: '#14532d', color: '#4ade80', border: '0.5px solid #166534', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>✓ Aprobar</button>
                      <button onClick={() => setEditId(editId === h.id ? null : h.id)} style={{ background: '#1e3a5f', color: '#60a5fa', border: '0.5px solid #1d4ed8', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => rechazar(h.id)} style={{ background: '#450a0a', color: '#f87171', border: '0.5px solid #7f1d1d', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal edición */}
      {editId && (
        <div style={{ background: '#12172a', border: '0.5px solid #3b1d8a', borderRadius: 12, padding: 18, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#60a5fa', marginBottom: 12 }}>Editar honorario</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            {['Subárea','Descripción','Monto líquido ($)','Presupuesto área ($)','N° documento'].map(f => (
              <div key={f}><label style={flabel}>{f}</label><input style={finput} type="text" placeholder={f} /></div>
            ))}
            <div>
              <label style={flabel}>Estado</label>
              <select style={finput}>
                {['Pendiente','En revisión','Aprobado','Pagado'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setEditId(null); mostrarNotif('Cambios guardados correctamente.'); }} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}>Guardar cambios</button>
            <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '0.5px solid #2a3245', borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}