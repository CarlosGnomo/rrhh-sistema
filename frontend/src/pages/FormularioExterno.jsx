import { useState } from 'react';
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

const BANCOS = [
  'Banco de Chile','Banco Estado','Banco Santander','Banco BCI',
  'Banco Falabella','Banco Ripley','Banco Security','Banco Itaú',
  'Banco BICE','Banco Internacional','Banco Consorcio','Banco BTG Pactual',
  'Banco Edwards (Citi)','Coopeuch','MACH (prepago)','Tenpo (prepago)','Otro',
];

// Colores base
const VERDE = '#4a5e2a';
const VERDE_CLARO = '#f0f4e8';
const BORDE = '#c8d5a8';

const finput = {
  width: '100%',
  background: '#fff',
  border: '1px solid ' + BORDE,
  borderRadius: 6,
  padding: '10px 14px',
  fontSize: 13,
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
};
const flabel = { fontSize: 12, color: '#333', marginBottom: 6, display: 'block', fontWeight: 500 };
const secTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: '#fff',
  background: VERDE,
  margin: '20px 0 14px',
  padding: '8px 14px',
  borderRadius: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

function fmtRut(val) {
  let v = val.replace(/[^0-9kK]/g, '');
  if (v.length > 1) {
    const body = v.slice(0, -1);
    const dv = v.slice(-1);
    let fmt = '', c = 0;
    for (let i = body.length - 1; i >= 0; i--) {
      fmt = body[i] + (c && c % 3 === 0 ? '.' : '') + fmt;
      c++;
    }
    return fmt + '-' + dv.toUpperCase();
  }
  return v;
}

export default function FormularioExterno() {
  const [area, setArea] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    rut: '', nombre: '', apellido_paterno: '', apellido_materno: '',
    subarea: '', descripcion: '', monto_liquido: '',
    banco: '', tipo_cuenta: '', numero_cuenta: '', correo: ''
  });

  const subareas = area ? AREAS[area] : [];

  function handleForm(e) {
    const { name, value } = e.target;
    if (name === 'rut') { setForm({ ...form, rut: fmtRut(value) }); return; }
    if (name === 'monto_liquido') {
      const num = value.replace(/\D/g, '');
      setForm({ ...form, monto_liquido: num ? parseInt(num).toLocaleString('es-CL') : '' });
      return;
    }
    setForm({ ...form, [name]: value });
  }

  function resetForm() {
    setEnviado(false);
    setForm({ rut: '', nombre: '', apellido_paterno: '', apellido_materno: '', subarea: '', descripcion: '', monto_liquido: '', banco: '', tipo_cuenta: '', numero_cuenta: '', correo: '' });
    setArea('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!area || !form.rut || !form.nombre || !form.apellido_paterno || !form.monto_liquido || !form.descripcion || !form.banco || !form.tipo_cuenta || !form.numero_cuenta) {
      setError('Por favor completa todos los campos obligatorios (*).');
      return;
    }
    setError('');
    setEnviando(true);
    const { error: err } = await supabase.from('honorarios').insert([{
      rut: form.rut, nombre: form.nombre, apellido_paterno: form.apellido_paterno,
      apellido_materno: form.apellido_materno, area, subarea: form.subarea,
      descripcion: form.descripcion,
      monto_liquido: parseInt(form.monto_liquido.replace(/\D/g, '')),
      banco: form.banco, tipo_cuenta: form.tipo_cuenta,
      numero_cuenta: form.numero_cuenta, correo: form.correo, estado: 'Pendiente'
    }]);
    setEnviando(false);
    if (err) { setError('Error al enviar. Por favor intenta nuevamente.'); }
    else { setEnviado(true); }
  }

  if (enviado) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '48px 40px', border: '1px solid ' + BORDE, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: VERDE }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Honorario enviado correctamente</h2>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
            Tu boleta ha sido recibida y quedara en estado <strong style={{ color: VERDE }}>Pendiente</strong> hasta ser aprobada por el area correspondiente.
          </p>
          <p style={{ fontSize: 13, color: '#888' }}>Puedes cerrar esta ventana.</p>
          <button onClick={resetForm} style={{ marginTop: 24, background: VERDE, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            Ingresar otro honorario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 20px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo-gnomo.png" alt="Gnomowear" style={{ height: 60, marginBottom: 16, objectFit: 'contain' }} />
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', margin: '0 0 6px', letterSpacing: '0.01em'
            BIENVENIDO AL PORTAL DE INGRESO DE BOLETA DE HONORARIOS
          </h1>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>Gnomowear — RRHH Central</p>
          <p style={{ fontSize: 12, color: '#888' }}>Completa el formulario para registrar tu prestacion de servicios</p>
        </div>

        {/* Formulario */}
        <div style={{ background: VERDE_CLARO, borderRadius: 12, padding: '28px 28px', border: '1px solid ' + BORDE, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
          <form onSubmit={handleSubmit}>

            {/* 1. Area y servicio */}
            <div style={secTitle}>1. Area y servicio</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={flabel}>Area <span style={{ color: '#c0392b' }}>*</span></label>
                <select style={finput} value={area} onChange={e => { setArea(e.target.value); setForm({ ...form, subarea: '' }); }} required>
                  <option value="">— Seleccionar area —</option>
                  {Object.keys(AREAS).map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={flabel}>Subarea <span style={{ color: '#c0392b' }}>*</span></label>
                <select style={finput} name="subarea" value={form.subarea} onChange={handleForm} required>
                  <option value="">— Seleccionar subarea —</option>
                  {subareas.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 2. Datos personales */}
            <div style={secTitle}>2. Datos personales</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={flabel}>RUT <span style={{ color: '#c0392b' }}>*</span></label>
                <input style={finput} name="rut" type="text" placeholder="12.345.678-9" value={form.rut} onChange={handleForm} required />
              </div>
              <div>
                <label style={flabel}>Nombre <span style={{ color: '#c0392b' }}>*</span></label>
                <input style={finput} name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleForm} required />
              </div>
              <div>
                <label style={flabel}>Apellido paterno <span style={{ color: '#c0392b' }}>*</span></label>
                <input style={finput} name="apellido_paterno" type="text" placeholder="Apellido paterno" value={form.apellido_paterno} onChange={handleForm} required />
              </div>
              <div>
                <label style={flabel}>Apellido materno</label>
                <input style={finput} name="apellido_materno" type="text" placeholder="Apellido materno" value={form.apellido_materno} onChange={handleForm} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={flabel}>Correo electronico</label>
                <input style={finput} name="correo" type="email" placeholder="tu@correo.cl" value={form.correo} onChange={handleForm} />
              </div>
            </div>

            {/* 3. Monto y glosa */}
            <div style={secTitle}>3. Monto y glosa</div>
            <div style={{ marginBottom: 14 }}>
              <label style={flabel}>Monto liquido <span style={{ color: '#c0392b' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid ' + BORDE, borderRadius: 6, padding: '10px 14px' }}>
                <span style={{ color: '#555', fontWeight: 700, marginRight: 8, fontSize: 16 }}>$</span>
                <input
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 20, fontWeight: 700, color: VERDE, width: '100%' }}
                  name="monto_liquido" type="text" placeholder="0"
                  value={form.monto_liquido} onChange={handleForm} required
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={flabel}>Glosa / descripcion del servicio <span style={{ color: '#c0392b' }}>*</span></label>
              <textarea
                style={{ ...finput, resize: 'none', lineHeight: 1.6 }}
                name="descripcion" rows={2}
                placeholder="Describe brevemente el servicio realizado..."
                value={form.descripcion} onChange={handleForm} required
              />
            </div>

            {/* 4. Datos bancarios */}
            <div style={secTitle}>4. Datos bancarios</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={flabel}>Banco <span style={{ color: '#c0392b' }}>*</span></label>
                <select style={finput} name="banco" value={form.banco} onChange={handleForm} required>
                  <option value="">— Seleccionar banco —</option>
                  {BANCOS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={flabel}>Tipo de cuenta <span style={{ color: '#c0392b' }}>*</span></label>
                <select style={finput} name="tipo_cuenta" value={form.tipo_cuenta} onChange={handleForm} required>
                  <option value="">— Tipo de cuenta —</option>
                  <option>Cuenta corriente</option>
                  <option>Cuenta vista</option>
                  <option>Cuenta de ahorro</option>
                  <option>Cuenta RUT</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={flabel}>N° de cuenta <span style={{ color: '#c0392b' }}>*</span></label>
                <input style={finput} name="numero_cuenta" type="text" placeholder="N° de cuenta" value={form.numero_cuenta} onChange={handleForm} required />
              </div>
            </div>

            {error && (
              <div style={{ background: '#fdf0f0', border: '1px solid #e0b0b0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#c0392b', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={enviando} style={{ width: '100%', background: VERDE, color: '#fff', border: 'none', borderRadius: 8, padding: 14, fontSize: 14, fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1, letterSpacing: '0.03em' }}>
              {enviando ? 'Enviando...' : 'Enviar honorario'}
            </button>

            <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 16 }}>
              Los campos marcados con <span style={{ color: '#c0392b' }}>*</span> son obligatorios
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}