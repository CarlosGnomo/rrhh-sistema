import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AREAS = {
  'Comercial y ventas B2B': ['Comercial y ventas B2B'],
  'Ventas en tienda': ['Tienda Foster Santiago','Tienda Casa Costanera Santiago','Tienda Chillán','Tienda Concepción','Tienda Osorno'],
  'Marketing': ['Marketing'],
  'Diseño y vestuario': ['Diseño y vestuario'],
  'Diseño gráfico': ['Diseño gráfico'],
  'Administración y finanzas': ['Administración y finanzas'],
  'Bodega': ['Bodega'],
};

const card = { background: '#1a1f2e', borderRadius: 10, padding: '14px 16px', border: '0.5px solid #2a3245', marginBottom: 10 };
const finput = { width: '100%', background: '#0f1117', border: '0.5px solid #2a3245', borderRadius: 7, padding: '8px 11px', fontSize: 13, color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' };
const flabel = { fontSize: 11, color: '#64748b', marginBottom: 5, display: 'block' };

export default function Honorarios() {
  const [showForm, setShowForm] = useState(false);
  const [area, setArea] = useState('');
  const [fileName, setFileName] = useState('');
  const [notif, setNotif] = useState('');
  const [honorarios, setHonorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({
    rut: '', nombre: '', apellido_paterno: '', apellido_materno: '',
    subarea: '', descripcion: '', monto_liquido: '', estado: 'Pendiente',
    numero_documento: '', banco: '', tipo_cuenta: '', numero_cuenta: '', correo: ''
  });

  useEffect(() => { cargarHonorarios(); }, []);

  async function cargarHonorarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from('honorarios')
      .select('*')
      .order('fecha_ingreso', { ascending: false });
    if (!error) setHonorarios(data || []);
    setLoading(false);
  }

  function handleForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!area || !form.rut || !form.nombre || !form.apellido_paterno || !form.monto_liquido) {
      setNotif('Por favor completa todos los campos obligatorios.');
      setTimeout(() => setNotif(''), 3000);
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from('honorarios').insert([{
      ...form,
      area,
      monto_liquido: parseInt(form.monto_liquido.replace(/\D/g, '')),
      estado: 'Pendiente'
    }]);
    if (error) {
      setNotif('Error al guardar. Intenta nuevamente.');
    } else {
      setNotif('Honorario enviado correctamente. Quedará en estado Pendiente hasta su aprobación.');
      setShowForm(false);
      setForm({ rut: '', nombre: '', apellido_paterno: '', apellido_materno: '', subarea: '', descripcion: '', monto_liquido: '', estado: 'Pendiente', numero_documento: '', banco: '', tipo_cuenta: '', numero_cuenta: '', correo: '' });
      setArea('');
      cargarHonorarios();
    }
    setEnviando(false);
    setTimeout(() => setNotif(''), 4000);
  }

  const subareas = area ? AREAS[area] : [];
  const estadoColor = e => e === 'Aprobado' ? '#34d399' : e === 'Pendiente' ? '#fbbf24' : '#60a5fa';

  return (
    <div>
      {notif && <div style={{ background: '#1e2d1e', border: '0.5px solid #166534', borderRadius: 8, padding: '10px 14px', color: '#4ade80', fontSize: 12, marginBottom: 10 }}>{notif}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#1a56db', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>Honorarios</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>Gestión de boletas</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, cursor: 'pointer' }}>
          {showForm ? '✕ Cerrar' : '+ Ingresar honorario'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, border: '0.5px solid #2d3a5a' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#60a5fa', marginBottom: 14, paddingBottom: 10, borderBottom: '0.5px solid #2a3245' }}>Datos del ingreso</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={flabel}>Área *</label>
                <select style={finput} value={area} onChange={e => { setArea(e.target.value); setForm({ ...form, subarea: '' }); }} required>
                  <option value="">— Área —</option>
                  {Object.keys(AREAS).map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={flabel}>Subárea *</label>
                <select style={finput} name="subarea" value={form.subarea} onChange={handleForm} required>
                  <option value="">— Subárea —</option>
                  {subareas.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={flabel}>Monto líquido *</label>
                <input style={{ ...finput, color: '#4ade80', fontSize: 16, fontWeight: 500 }} name="monto_liquido" type="text" placeholder="0" value={form.monto_liquido} onChange={handleForm} required />
              </div>
              <div>
                <label style={flabel}>N° documento</label>
                <input style={finput} name="numero_documento" type="text" placeholder="BOL-2025-0042" value={form.numero_documento} onChange={handleForm} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={flabel}>RUT *</label><input style={finput} name="rut" type="text" placeholder="12.345.678-9" value={form.rut} onChange={handleForm} required /></div>
              <div><label style={flabel}>Nombre *</label><input style={finput} name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleForm} required /></div>
              <div><label style={flabel}>Apellido paterno *</label><input style={finput} name="apellido_paterno" type="text" placeholder="Apellido paterno" value={form.apellido_paterno} onChange={handleForm} required /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={flabel}>Apellido materno</label><input style={finput} name="apellido_materno" type="text" placeholder="Apellido materno" value={form.apellido_materno} onChange={handleForm} /></div>
              <div>
                <label style={flabel}>Estado</label>
                <select style={finput} name="estado" value={form.estado} onChange={handleForm}>
                  <option>Pendiente</option>
                  <option>En revisión</option>
                  <option>Aprobado</option>
                  <option>Pagado</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={flabel}>Descripción del servicio *</label>
              <textarea style={{ ...finput, resize: 'vertical', lineHeight: 1.5 }} name="descripcion" rows={2} placeholder="Describe el servicio realizado..." value={form.descripcion} onChange={handleForm} required />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={flabel}>Datos bancarios</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <input style={finput} name="banco" type="text" placeholder="Banco" value={form.banco} onChange={handleForm} />
                <input style={finput} name="tipo_cuenta" type="text" placeholder="Tipo de cuenta" value={form.tipo_cuenta} onChange={handleForm} />
                <input style={finput} name="numero_cuenta" type="text" placeholder="N° de cuenta" value={form.numero_cuenta} onChange={handleForm} />
                <input style={finput} name="correo" type="email" placeholder="Correo electrónico" value={form.correo} onChange={handleForm} />
              </div>
            </div>

            <div onClick={() => document.getElementById('fileInput').click()} style={{ border: '1px dashed #2a3245', borderRadius: 8, padding: 18, textAlign: 'center', cursor: 'pointer', background: '#0a0e18', marginBottom: 12 }}>
              <div style={{ fontSize: 24, color: '#334155', marginBottom: 6 }}>↑</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Adjuntar boleta de honorarios</div>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>PDF, JPG o PNG · Máx. 10 MB</div>
              {fileName && <div style={{ fontSize: 12, color: '#34d399', marginTop: 6 }}>✓ {fileName}</div>}
              <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setFileName(e.target.files[0]?.name || '')} />
            </div>

            <button type="submit" disabled={enviando} style={{ width: '100%', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 13, fontWeight: 500, cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1 }}>
              {enviando ? 'Enviando...' : '↗ Enviar honorario'}
            </button>
          </form>
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 500, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 10px' }}>
        Honorarios registrados {loading ? '...' : `(${honorarios.length})`}
      </div>
      <div style={{ ...card, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ color: '#4a5568', fontSize: 12, padding: 20, textAlign: 'center' }}>Cargando honorarios...</div>
        ) : honorarios.length === 0 ? (
          <div style={{ color: '#4a5568', fontSize: 12, padding: 20, textAlign: 'center' }}>No hay honorarios registrados aún.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Prestador','Área','Subárea','Descripción','Monto','Estado','N° doc.','Fecha'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#4a5568', padding: '8px 10px', borderBottom: '0.5px solid #2a3245', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {honorarios.map((h, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#e2e8f0', fontWeight: 500, borderBottom: '0.5px solid #1e2233' }}>{h.nombre} {h.apellido_paterno}</td>
                  <td style={{ padding: '8px 10px', color: '#94a3b8', borderBottom: '0.5px solid #1e2233' }}>{h.area}</td>
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