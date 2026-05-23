import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';

const VERDE       = '#4a5e2a';
const VERDE_CLARO = '#f0f4e8';
const FONDO       = '#eef2e6';
const BORDE       = '#c8d5a8';
const TEXTO       = '#4a5568';

const TIPOS_DEMANDA = [
  'Despido injustificado','Cobro de prestaciones','Acoso laboral',
  'Acoso sexual','Tutela laboral','Autodespido','Otro'
];
const ESTADOS_JUICIO   = ['En curso','Sentencia','Apelacion','Cerrado'];
const TIPOS_SANCION    = ['Amonestacion verbal','Amonestacion escrita','Multa','Suspension'];
const ESTADOS_SANCION  = ['Vigente','Cumplida','Apelada'];
const TIPOS_ACUERDO    = ['Acuerdo interno','Mediacion','Ley Karin'];
const ESTADOS_ACUERDO  = ['En investigacion','Acuerdo firmado','Cerrado','Derivado DT'];
const AREAS            = ['Comercial y ventas B2B','Ventas en tienda','Marketing','Diseño y vestuario','Diseño gráfico','Administración y finanzas','Bodega'];

const card  = { background:'#fff', borderRadius:10, padding:'16px', border:'1px solid '+BORDE, marginBottom:10 };
const finput = { width:'100%', background:'#f9fbf5', border:'1px solid '+BORDE, borderRadius:6, padding:'8px 12px', fontSize:13, color:'#1a1a1a', outline:'none', boxSizing:'border-box' };
const flabel = { fontSize:11, color:'#555', marginBottom:5, display:'block', fontWeight:500 };
const secTitle = { fontSize:13, fontWeight:700, color:'#fff', background:VERDE, padding:'8px 14px', borderRadius:6, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:14 };

const estadoColorJuicio  = e => ({'En curso':'#d97706','Sentencia':'#2563eb','Apelacion':'#ea580c','Cerrado':'#6b7280'}[e]||'#6b7280');
const estadoColorSancion = e => ({'Vigente':'#dc2626','Cumplida':'#16a34a','Apelada':'#d97706'}[e]||'#6b7280');
const estadoColorAcuerdo = e => ({'En investigacion':'#dc2626','Acuerdo firmado':'#16a34a','Cerrado':'#6b7280','Derivado DT':'#2563eb'}[e]||'#6b7280');

function Badge({ text, color }) {
  return <span style={{ background: color+'22', color, border:'1px solid '+color+'55', borderRadius:999, padding:'3px 12px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>{text}</span>;
}

function PanelDetalle({ item, tipo, onCerrar }) {
  const hoy = new Date();
  return (
    <div style={{ background:VERDE_CLARO, border:'1px solid '+BORDE, borderRadius:12, padding:20, marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:VERDE }}>Detalle del registro</div>
        <button onClick={onCerrar} style={{ background:'transparent', border:'1px solid '+BORDE, borderRadius:6, padding:'4px 12px', fontSize:12, color:'#555', cursor:'pointer' }}>✕ Cerrar</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {tipo === 'juicio' && <>
          <div><div style={{ fontSize:11, color:'#888' }}>Trabajador</div><div style={{ fontWeight:600, color:'#1a1a1a' }}>{item.nombre_trabajador}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>RIT</div><div style={{ color:TEXTO }}>{item.rit||'-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Tribunal</div><div style={{ color:TEXTO }}>{item.tribunal}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Fecha despido</div><div style={{ color:TEXTO }}>{item.fecha_despido ? new Date(item.fecha_despido+'T12:00:00').toLocaleDateString('es-CL') : '-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Abogado patrocinante</div><div style={{ color:TEXTO }}>{item.abogado_patrocinante||'-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Tipo demanda</div><div style={{ color:TEXTO }}>{item.tipo_demanda}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Estado</div><div>{item.estado}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Monto demanda</div><div style={{ color:'#dc2626', fontWeight:600 }}>{item.monto_demanda ? '$'+item.monto_demanda.toLocaleString('es-CL') : '-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Abogado Gnomo</div><div style={{ color:TEXTO }}>{item.abogado_gnomo||'-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Honorarios</div><div style={{ color:TEXTO }}>{item.honorarios ? '$'+item.honorarios.toLocaleString('es-CL') : '-'}</div></div>
          {item.link_drive && <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, color:'#888' }}>Carpeta Drive</div><a href={item.link_drive} target="_blank" rel="noopener noreferrer" style={{ color:VERDE, fontWeight:600 }}>Abrir carpeta →</a></div>}
          <div style={{ gridColumn:'1/-1' }}>
            <div style={{ fontSize:11, color:'#888', marginBottom:6 }}>Fechas de audiencia</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {(item.fechas_audiencias||[]).length === 0 ? <span style={{ color:'#888', fontSize:12 }}>Sin fechas registradas</span>
              : (item.fechas_audiencias||[]).sort().map(f => {
                const fd = new Date(f+'T12:00:00');
                const alerta = fd >= hoy && (fd-hoy)/(1000*60*60*24) <= 7;
                return <span key={f} style={{ background: alerta ? '#fee2e2' : '#fff', border:'1px solid '+(alerta?'#dc2626':BORDE), borderRadius:6, padding:'4px 12px', fontSize:12, color: alerta ? '#dc2626' : TEXTO, fontWeight: alerta ? 700 : 400 }}>
                  {alerta ? '⚠ ' : ''}{fd.toLocaleDateString('es-CL')}
                </span>;
              })}
            </div>
          </div>
          <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Observaciones</div><div style={{ background:'#fff', border:'1px solid '+BORDE, borderRadius:6, padding:'10px 12px', fontSize:13, color:TEXTO, whiteSpace:'pre-wrap' }}>{item.observaciones||'Sin observaciones.'}</div></div>
        </>}
        {tipo === 'sancion' && <>
          <div><div style={{ fontSize:11, color:'#888' }}>Trabajador</div><div style={{ fontWeight:600, color:'#1a1a1a' }}>{item.nombre_trabajador}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Area</div><div style={{ color:TEXTO }}>{item.area}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Tipo sancion</div><div style={{ color:TEXTO }}>{item.tipo_sancion}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Fecha</div><div style={{ color:TEXTO }}>{item.fecha ? new Date(item.fecha+'T12:00:00').toLocaleDateString('es-CL') : '-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Estado</div><div>{item.estado}</div></div>
          <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Motivo</div><div style={{ background:'#fff', border:'1px solid '+BORDE, borderRadius:6, padding:'10px 12px', fontSize:13, color:TEXTO }}>{item.motivo}</div></div>
          <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Observaciones</div><div style={{ background:'#fff', border:'1px solid '+BORDE, borderRadius:6, padding:'10px 12px', fontSize:13, color:TEXTO, whiteSpace:'pre-wrap' }}>{item.observaciones||'Sin observaciones.'}</div></div>
        </>}
        {tipo === 'acuerdo' && <>
          <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, color:'#888' }}>Trabajador(es)</div><div style={{ fontWeight:600, color:'#1a1a1a' }}>{item.trabajadores}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Tipo</div><div style={{ color:TEXTO }}>{item.tipo}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Fecha inicio</div><div style={{ color:TEXTO }}>{item.fecha_inicio ? new Date(item.fecha_inicio+'T12:00:00').toLocaleDateString('es-CL') : '-'}</div></div>
          <div><div style={{ fontSize:11, color:'#888' }}>Estado</div><div>{item.estado}</div></div>
          <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Observaciones</div><div style={{ background:'#fff', border:'1px solid '+BORDE, borderRadius:6, padding:'10px 12px', fontSize:13, color:TEXTO, whiteSpace:'pre-wrap' }}>{item.observaciones||'Sin observaciones.'}</div></div>
        </>}
      </div>
    </div>
  );
}

// ─── FORMULARIO JUICIO ───────────────────────────────────────────────────────
function FormJuicio({ onGuardar, onCancelar, inicial }) {
  const { perfil } = useAuth();
  const [form, setForm] = useState(inicial || {
    rit:'', tribunal:'', fecha_despido:'', nombre_trabajador:'',
    abogado_patrocinante:'', tipo_demanda:'', estado:'En curso',
    fechas_audiencias:[], monto_demanda:'', abogado_gnomo:'',
    honorarios:'', link_drive:'', observaciones:''
  });
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function set(k,v) { setForm(f => ({...f,[k]:v})); }

  function agregarFecha() {
    if (!nuevaFecha) return;
    if (!form.fechas_audiencias.includes(nuevaFecha)) {
      set('fechas_audiencias', [...form.fechas_audiencias, nuevaFecha].sort());
    }
    setNuevaFecha('');
  }

  function quitarFecha(f) { set('fechas_audiencias', form.fechas_audiencias.filter(x=>x!==f)); }

  async function guardar() {
    if (!form.tribunal || !form.nombre_trabajador || !form.tipo_demanda || !form.estado) {
      setError('Completa los campos obligatorios (*).');
      return;
    }
    setError('');
    setEnviando(true);
    const payload = {
      ...form,
      monto_demanda: form.monto_demanda ? parseInt(String(form.monto_demanda).replace(/\D/g,'')) : null,
      honorarios:    form.honorarios    ? parseInt(String(form.honorarios).replace(/\D/g,''))    : null,
      creado_por: perfil?.correo,
      actualizado_en: new Date().toISOString(),
    };
    let err;
    if (form.id) {
      ({ error: err } = await supabase.from('juicios_laborales').update(payload).eq('id', form.id));
    } else {
      ({ error: err } = await supabase.from('juicios_laborales').insert([payload]));
    }
    setEnviando(false);
    if (err) { setError('Error al guardar.'); return; }
    onGuardar();
  }

  return (
    <div style={{ background:VERDE_CLARO, border:'1px solid '+BORDE, borderRadius:12, padding:20, marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:VERDE, marginBottom:14 }}>{form.id ? 'Editar causa' : 'Nueva causa judicial'}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div><label style={flabel}>RIT</label><input style={finput} value={form.rit} onChange={e=>set('rit',e.target.value)} placeholder="O-1234-2024"/></div>
        <div><label style={flabel}>Tribunal <span style={{color:'#c0392b'}}>*</span></label><input style={finput} value={form.tribunal} onChange={e=>set('tribunal',e.target.value)} placeholder="Nombre del tribunal"/></div>
        <div><label style={flabel}>Fecha despido</label><input style={finput} type="date" value={form.fecha_despido} onChange={e=>set('fecha_despido',e.target.value)}/></div>
        <div><label style={flabel}>Nombre trabajador <span style={{color:'#c0392b'}}>*</span></label><input style={finput} value={form.nombre_trabajador} onChange={e=>set('nombre_trabajador',e.target.value)}/></div>
        <div><label style={flabel}>Abogado patrocinante</label><input style={finput} value={form.abogado_patrocinante} onChange={e=>set('abogado_patrocinante',e.target.value)}/></div>
        <div><label style={flabel}>Tipo de demanda <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.tipo_demanda} onChange={e=>set('tipo_demanda',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {TIPOS_DEMANDA.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label style={flabel}>Estado <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.estado} onChange={e=>set('estado',e.target.value)}>
            {ESTADOS_JUICIO.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label style={flabel}>Monto demanda ($)</label><input style={finput} value={form.monto_demanda} onChange={e=>set('monto_demanda',e.target.value)} placeholder="0"/></div>
        <div><label style={flabel}>Abogado / empresa que representa a Gnomo</label><input style={finput} value={form.abogado_gnomo} onChange={e=>set('abogado_gnomo',e.target.value)}/></div>
        <div><label style={flabel}>Honorarios ($)</label><input style={finput} value={form.honorarios} onChange={e=>set('honorarios',e.target.value)} placeholder="0"/></div>
        <div><label style={flabel}>Link carpeta Drive</label><input style={finput} value={form.link_drive} onChange={e=>set('link_drive',e.target.value)} placeholder="https://drive.google.com/..."/></div>
      </div>

      {/* Fechas audiencias */}
      <div style={{ marginBottom:12 }}>
        <label style={flabel}>Fechas de audiencia</label>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input style={{...finput, width:'auto', flex:1}} type="date" value={nuevaFecha} onChange={e=>setNuevaFecha(e.target.value)}/>
          <button onClick={agregarFecha} style={{ background:VERDE, color:'#fff', border:'none', borderRadius:6, padding:'8px 16px', fontSize:12, cursor:'pointer', fontWeight:600 }}>+ Agregar</button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {form.fechas_audiencias.map(f => (
            <span key={f} style={{ background:'#fff', border:'1px solid '+BORDE, borderRadius:6, padding:'4px 10px', fontSize:12, color:TEXTO, display:'flex', alignItems:'center', gap:6 }}>
              {new Date(f+'T12:00:00').toLocaleDateString('es-CL')}
              <span onClick={()=>quitarFecha(f)} style={{ color:'#c0392b', cursor:'pointer', fontWeight:700 }}>×</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <label style={flabel}>Observaciones</label>
        <textarea style={{...finput, resize:'none'}} rows={3} value={form.observaciones} onChange={e=>set('observaciones',e.target.value)} placeholder="Notas adicionales..."/>
      </div>

      {error && <div style={{ color:'#c0392b', fontSize:12, marginBottom:10 }}>{error}</div>}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={guardar} disabled={enviando} style={{ background:VERDE, color:'#fff', border:'none', borderRadius:7, padding:'9px 20px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
          {enviando ? 'Guardando...' : 'Guardar causa'}
        </button>
        <button onClick={onCancelar} style={{ background:'transparent', border:'1px solid '+BORDE, borderRadius:7, padding:'9px 16px', fontSize:12, color:'#555', cursor:'pointer' }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── FORMULARIO SANCION ──────────────────────────────────────────────────────
function FormSancion({ onGuardar, onCancelar, inicial }) {
  const { perfil } = useAuth();
  const [form, setForm] = useState(inicial || {
    nombre_trabajador:'', area:'', tipo_sancion:'', fecha:'', motivo:'', estado:'Vigente', observaciones:''
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function set(k,v) { setForm(f=>({...f,[k]:v})); }

  async function guardar() {
    if (!form.nombre_trabajador || !form.area || !form.tipo_sancion || !form.fecha || !form.motivo) {
      setError('Completa los campos obligatorios (*).');
      return;
    }
    setError('');
    setEnviando(true);
    const payload = { ...form, creado_por: perfil?.correo, actualizado_en: new Date().toISOString() };
    let err;
    if (form.id) {
      ({ error: err } = await supabase.from('sanciones_disciplinarias').update(payload).eq('id', form.id));
    } else {
      ({ error: err } = await supabase.from('sanciones_disciplinarias').insert([payload]));
    }
    setEnviando(false);
    if (err) { setError('Error al guardar.'); return; }
    onGuardar();
  }

  return (
    <div style={{ background:VERDE_CLARO, border:'1px solid '+BORDE, borderRadius:12, padding:20, marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:VERDE, marginBottom:14 }}>{form.id ? 'Editar sancion' : 'Nueva sancion disciplinaria'}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div><label style={flabel}>Trabajador <span style={{color:'#c0392b'}}>*</span></label><input style={finput} value={form.nombre_trabajador} onChange={e=>set('nombre_trabajador',e.target.value)}/></div>
        <div><label style={flabel}>Area <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.area} onChange={e=>set('area',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {AREAS.map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
        <div><label style={flabel}>Tipo de sancion <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.tipo_sancion} onChange={e=>set('tipo_sancion',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {TIPOS_SANCION.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label style={flabel}>Fecha <span style={{color:'#c0392b'}}>*</span></label><input style={finput} type="date" value={form.fecha} onChange={e=>set('fecha',e.target.value)}/></div>
        <div><label style={flabel}>Estado <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.estado} onChange={e=>set('estado',e.target.value)}>
            {ESTADOS_SANCION.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={flabel}>Motivo <span style={{color:'#c0392b'}}>*</span></label>
        <textarea style={{...finput, resize:'none'}} rows={3} value={form.motivo} onChange={e=>set('motivo',e.target.value)} placeholder="Descripcion del incumplimiento..."/>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={flabel}>Observaciones</label>
        <textarea style={{...finput, resize:'none'}} rows={2} value={form.observaciones} onChange={e=>set('observaciones',e.target.value)}/>
      </div>
      {error && <div style={{ color:'#c0392b', fontSize:12, marginBottom:10 }}>{error}</div>}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={guardar} disabled={enviando} style={{ background:VERDE, color:'#fff', border:'none', borderRadius:7, padding:'9px 20px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
          {enviando ? 'Guardando...' : 'Guardar sancion'}
        </button>
        <button onClick={onCancelar} style={{ background:'transparent', border:'1px solid '+BORDE, borderRadius:7, padding:'9px 16px', fontSize:12, color:'#555', cursor:'pointer' }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── FORMULARIO ACUERDO ──────────────────────────────────────────────────────
function FormAcuerdo({ onGuardar, onCancelar, inicial }) {
  const { perfil } = useAuth();
  const [form, setForm] = useState(inicial || {
    trabajadores:'', tipo:'', fecha_inicio:'', estado:'En investigacion', observaciones:''
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function set(k,v) { setForm(f=>({...f,[k]:v})); }

  async function guardar() {
    if (!form.trabajadores || !form.tipo || !form.fecha_inicio) {
      setError('Completa los campos obligatorios (*).');
      return;
    }
    setError('');
    setEnviando(true);
    const payload = { ...form, creado_por: perfil?.correo, actualizado_en: new Date().toISOString() };
    let err;
    if (form.id) {
      ({ error: err } = await supabase.from('acuerdos_mediaciones').update(payload).eq('id', form.id));
    } else {
      ({ error: err } = await supabase.from('acuerdos_mediaciones').insert([payload]));
    }
    setEnviando(false);
    if (err) { setError('Error al guardar.'); return; }
    onGuardar();
  }

  return (
    <div style={{ background:VERDE_CLARO, border:'1px solid '+BORDE, borderRadius:12, padding:20, marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:VERDE, marginBottom:14 }}>{form.id ? 'Editar acuerdo' : 'Nuevo acuerdo / mediacion'}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div style={{ gridColumn:'1/-1' }}><label style={flabel}>Trabajador(es) involucrados <span style={{color:'#c0392b'}}>*</span></label><input style={finput} value={form.trabajadores} onChange={e=>set('trabajadores',e.target.value)} placeholder="Nombre(s) completo(s)"/></div>
        <div><label style={flabel}>Tipo <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.tipo} onChange={e=>set('tipo',e.target.value)}>
            <option value="">— Seleccionar —</option>
            {TIPOS_ACUERDO.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label style={flabel}>Fecha inicio <span style={{color:'#c0392b'}}>*</span></label><input style={finput} type="date" value={form.fecha_inicio} onChange={e=>set('fecha_inicio',e.target.value)}/></div>
        <div><label style={flabel}>Estado <span style={{color:'#c0392b'}}>*</span></label>
          <select style={finput} value={form.estado} onChange={e=>set('estado',e.target.value)}>
            {ESTADOS_ACUERDO.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={flabel}>Observaciones</label>
        <textarea style={{...finput, resize:'none'}} rows={3} value={form.observaciones} onChange={e=>set('observaciones',e.target.value)}/>
      </div>
      {error && <div style={{ color:'#c0392b', fontSize:12, marginBottom:10 }}>{error}</div>}
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={guardar} disabled={enviando} style={{ background:VERDE, color:'#fff', border:'none', borderRadius:7, padding:'9px 20px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
          {enviando ? 'Guardando...' : 'Guardar registro'}
        </button>
        <button onClick={onCancelar} style={{ background:'transparent', border:'1px solid '+BORDE, borderRadius:7, padding:'9px 16px', fontSize:12, color:'#555', cursor:'pointer' }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function Juicios() {
  const [tab, setTab] = useState('juicios');
  const [juicios, setJuicios] = useState([]);
  const [sanciones, setSanciones] = useState([]);
  const [acuerdos, setAcuerdos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [viendo, setViendo] = useState(null);
  const [notif, setNotif] = useState('');

  useEffect(() => { cargarDatos(); }, [tab]);

  async function cargarDatos() {
    setLoading(true);
    if (tab === 'juicios') {
      const { data } = await supabase.from('juicios_laborales').select('*').order('creado_en', { ascending: false });
      setJuicios(data || []);
    } else if (tab === 'sanciones') {
      const { data } = await supabase.from('sanciones_disciplinarias').select('*').order('fecha', { ascending: false });
      setSanciones(data || []);
    } else {
      const { data } = await supabase.from('acuerdos_mediaciones').select('*').order('fecha_inicio', { ascending: false });
      setAcuerdos(data || []);
    }
    setLoading(false);
  }

  function notificar(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000); }

  async function eliminar(tabla, id) {
    if (!window.confirm('Confirmas eliminar este registro?')) return;
    await supabase.from(tabla).delete().eq('id', id);
    notificar('Registro eliminado.');
    cargarDatos();
  }

  function onGuardar() {
    setMostrarForm(false);
    setEditando(null);
    notificar('Registro guardado correctamente.');
    cargarDatos();
  }

  // Indicadores
  const juiciosActivos = juicios.filter(j => j.estado !== 'Cerrado').length;
  const montoRiesgo    = juicios.filter(j => j.estado !== 'Cerrado').reduce((s,j) => s + (j.monto_demanda||0), 0);
  const hoy            = new Date();
  const proxAudiencia  = juicios.flatMap(j => (j.fechas_audiencias||[]).map(f => new Date(f+'T12:00:00'))).filter(f => f >= hoy).sort((a,b) => a-b)[0];
  const sancionesVigentes = sanciones.filter(s => s.estado === 'Vigente').length;
  const acuerdosActivos   = acuerdos.filter(a => a.estado === 'En investigacion').length;
  const leyKarinActivos   = acuerdos.filter(a => a.tipo === 'Ley Karin' && a.estado === 'En investigacion').length;

  const tabs = [
    { id:'juicios',   label:'Juicios laborales' },
    { id:'sanciones', label:'Sanciones disciplinarias' },
    { id:'acuerdos',  label:'Acuerdos y mediaciones' },
  ];

  return (
    <div style={{ background:FONDO, minHeight:'calc(100vh - 60px)', margin:'-20px', padding:'20px' }}>

      {notif && <div style={{ background:'#edfaf1', border:'1px solid #a7d7b0', borderRadius:8, padding:'10px 14px', color:VERDE, fontSize:12, marginBottom:10, fontWeight:500 }}>{notif}</div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ background:VERDE, color:'#fff', borderRadius:6, padding:'4px 10px', fontSize:12, fontWeight:600 }}>Juicios y Sanciones</span>
          <span style={{ fontSize:15, fontWeight:500, color:TEXTO }}>Gestion legal y disciplinaria</span>
        </div>
      </div>

      {/* Indicadores globales */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Juicios activos',       value: juiciosActivos,    color: '#d97706' },
          { label:'Monto en riesgo',        value: montoRiesgo > 0 ? '$'+montoRiesgo.toLocaleString('es-CL') : '-', color: '#dc2626' },
          { label:'Sanciones vigentes',     value: sancionesVigentes, color: '#7c3aed' },
          { label:'Casos Ley Karin activos',value: leyKarinActivos,   color: '#dc2626' },
        ].map(k => (
          <div key={k.label} style={{ background:'#fff', borderRadius:10, padding:'14px 16px', border:'1px solid '+BORDE }}>
            <div style={{ fontSize:11, color:'#555', marginBottom:6 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:'2px solid '+BORDE }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMostrarForm(false); setEditando(null); setViendo(null); }}
            style={{ padding:'10px 20px', fontSize:13, fontWeight: tab===t.id ? 700 : 400,
              color: tab===t.id ? VERDE : '#777', background:'transparent', border:'none',
              borderBottom: tab===t.id ? '3px solid '+VERDE : '3px solid transparent',
              cursor:'pointer', marginBottom:-2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Boton nuevo */}
      {!mostrarForm && !editando && (
        <div style={{ marginBottom:12 }}>
          <button onClick={() => setMostrarForm(true)}
            style={{ background:VERDE, color:'#fff', border:'none', borderRadius:7, padding:'9px 18px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
            + Nuevo registro
          </button>
        </div>
      )}

      {/* Formularios */}
      {(mostrarForm || editando) && tab === 'juicios' && (
        <FormJuicio inicial={editando} onGuardar={onGuardar} onCancelar={() => { setMostrarForm(false); setEditando(null); }}/>
      )}
      {(mostrarForm || editando) && tab === 'sanciones' && (
        <FormSancion inicial={editando} onGuardar={onGuardar} onCancelar={() => { setMostrarForm(false); setEditando(null); }}/>
      )}
      {(mostrarForm || editando) && tab === 'acuerdos' && (
        <FormAcuerdo inicial={editando} onGuardar={onGuardar} onCancelar={() => { setMostrarForm(false); setEditando(null); }}/>
      )}

      {/* Panel detalle */}
      {viendo && tab === 'juicios'   && <PanelDetalle item={viendo} tipo="juicio"  onCerrar={() => setViendo(null)}/>}
      {viendo && tab === 'sanciones' && <PanelDetalle item={viendo} tipo="sancion" onCerrar={() => setViendo(null)}/>}
      {viendo && tab === 'acuerdos'  && <PanelDetalle item={viendo} tipo="acuerdo" onCerrar={() => setViendo(null)}/>}

      {/* Tabla Juicios */}
      {tab === 'juicios' && !mostrarForm && !editando && (
        <div style={card}>
          <div style={secTitle}>Causas judiciales ({juicios.length})</div>
          {loading ? <div style={{ color:TEXTO, fontSize:12, padding:20, textAlign:'center' }}>Cargando...</div>
          : juicios.length === 0 ? <div style={{ color:TEXTO, fontSize:12, padding:20, textAlign:'center' }}>No hay causas registradas.</div>
          : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>{['Trabajador','RIT','Tribunal','Tipo demanda','Estado','Proxima audiencia','Monto','Drive','Acciones'].map(h=>(
                    <th key={h} style={{ textAlign:'left', color:TEXTO, padding:'8px 10px', borderBottom:'1px solid '+BORDE, fontSize:11, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {juicios.map(j => {
                    const proxFecha = (j.fechas_audiencias||[]).map(f=>new Date(f+'T12:00:00')).filter(f=>f>=hoy).sort((a,b)=>a-b)[0];
                    const alertaAudiencia = proxFecha && (proxFecha-hoy)/(1000*60*60*24) <= 7;
                    return (
                      <tr key={j.id}>
                        <td style={{ padding:'8px 10px', color:'#1a1a1a', fontWeight:500, borderBottom:'1px solid '+BORDE, whiteSpace:'nowrap' }}>{j.nombre_trabajador}</td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{j.rit||'-'}</td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{j.tribunal}</td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{j.tipo_demanda}</td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}><Badge text={j.estado} color={estadoColorJuicio(j.estado)}/></td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE, whiteSpace:'nowrap' }}>
                          {proxFecha ? (
                            <span style={{ color: alertaAudiencia ? '#dc2626' : TEXTO, fontWeight: alertaAudiencia ? 700 : 400 }}>
                              {alertaAudiencia ? '⚠ ' : ''}{proxFecha.toLocaleDateString('es-CL')}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{j.monto_demanda ? '$'+j.monto_demanda.toLocaleString('es-CL') : '-'}</td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}>
                          {j.link_drive ? <a href={j.link_drive} target="_blank" rel="noopener noreferrer" style={{ color:VERDE, fontWeight:600, fontSize:11 }}>Ver →</a> : '-'}
                        </td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}>
                          <div style={{ display:'flex', gap:5 }}>
                            <button onClick={()=>{ setViendo(j); setMostrarForm(false); setEditando(null); }} style={{ background:'#14532d', color:'#4ade80', border:'0.5px solid #166534', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>Ver</button>
                            <button onClick={()=>{ setEditando(j); setViendo(null); }} style={{ background:'#1e3a5f', color:'#60a5fa', border:'0.5px solid #1d4ed8', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>Editar</button>
                            <button onClick={()=>eliminar('juicios_laborales',j.id)} style={{ background:'#450a0a', color:'#f87171', border:'0.5px solid #7f1d1d', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Sanciones */}
      {tab === 'sanciones' && !mostrarForm && !editando && (
        <div style={card}>
          <div style={secTitle}>Sanciones disciplinarias ({sanciones.length})</div>
          {loading ? <div style={{ color:TEXTO, fontSize:12, padding:20, textAlign:'center' }}>Cargando...</div>
          : sanciones.length === 0 ? <div style={{ color:TEXTO, fontSize:12, padding:20, textAlign:'center' }}>No hay sanciones registradas.</div>
          : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>{['Trabajador','Area','Tipo sancion','Fecha','Estado','Motivo','Acciones'].map(h=>(
                    <th key={h} style={{ textAlign:'left', color:TEXTO, padding:'8px 10px', borderBottom:'1px solid '+BORDE, fontSize:11, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {sanciones.map(s => (
                    <tr key={s.id}>
                      <td style={{ padding:'8px 10px', color:'#1a1a1a', fontWeight:500, borderBottom:'1px solid '+BORDE }}>{s.nombre_trabajador}</td>
                      <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{s.area}</td>
                      <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{s.tipo_sancion}</td>
                      <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE, whiteSpace:'nowrap' }}>{s.fecha ? new Date(s.fecha+'T12:00:00').toLocaleDateString('es-CL') : '-'}</td>
                      <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}><Badge text={s.estado} color={estadoColorSancion(s.estado)}/></td>
                      <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE, maxWidth:200 }}>{s.motivo}</td>
                      <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button onClick={()=>{ setViendo(s); setMostrarForm(false); setEditando(null); }} style={{ background:'#14532d', color:'#4ade80', border:'0.5px solid #166534', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>Ver</button>
                          <button onClick={()=>{ setEditando(s); setViendo(null); }} style={{ background:'#1e3a5f', color:'#60a5fa', border:'0.5px solid #1d4ed8', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>Editar</button>
                          <button onClick={()=>eliminar('sanciones_disciplinarias',s.id)} style={{ background:'#450a0a', color:'#f87171', border:'0.5px solid #7f1d1d', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Acuerdos */}
      {tab === 'acuerdos' && !mostrarForm && !editando && (
        <div style={card}>
          <div style={secTitle}>Acuerdos y mediaciones ({acuerdos.length})</div>
          {loading ? <div style={{ color:TEXTO, fontSize:12, padding:20, textAlign:'center' }}>Cargando...</div>
          : acuerdos.length === 0 ? <div style={{ color:TEXTO, fontSize:12, padding:20, textAlign:'center' }}>No hay registros.</div>
          : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr>{['Trabajador(es)','Tipo','Fecha inicio','Estado','Dias transcurridos','Observaciones','Acciones'].map(h=>(
                    <th key={h} style={{ textAlign:'left', color:TEXTO, padding:'8px 10px', borderBottom:'1px solid '+BORDE, fontSize:11, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {acuerdos.map(a => {
                    const inicio   = new Date(a.fecha_inicio+'T12:00:00');
                    const dias     = Math.floor((hoy-inicio)/(1000*60*60*24));
                    const alertaDias = a.estado === 'En investigacion' && dias > 30;
                    return (
                      <tr key={a.id}>
                        <td style={{ padding:'8px 10px', color:'#1a1a1a', fontWeight:500, borderBottom:'1px solid '+BORDE }}>{a.trabajadores}</td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE }}>{a.tipo}</td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE, whiteSpace:'nowrap' }}>{inicio.toLocaleDateString('es-CL')}</td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}><Badge text={a.estado} color={estadoColorAcuerdo(a.estado)}/></td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}>
                          <span style={{ color: alertaDias ? '#dc2626' : TEXTO, fontWeight: alertaDias ? 700 : 400 }}>
                            {alertaDias ? '⚠ ' : ''}{dias} dias
                          </span>
                        </td>
                        <td style={{ padding:'8px 10px', color:TEXTO, borderBottom:'1px solid '+BORDE, maxWidth:180 }}>{a.observaciones||'-'}</td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid '+BORDE }}>
                          <div style={{ display:'flex', gap:5 }}>
                            <button onClick={()=>{ setViendo(a); setMostrarForm(false); setEditando(null); }} style={{ background:'#14532d', color:'#4ade80', border:'0.5px solid #166534', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>Ver</button>
                            <button onClick={()=>{ setEditando(a); setViendo(null); }} style={{ background:'#1e3a5f', color:'#60a5fa', border:'0.5px solid #1d4ed8', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>Editar</button>
                            <button onClick={()=>eliminar('acuerdos_mediaciones',a.id)} style={{ background:'#450a0a', color:'#f87171', border:'0.5px solid #7f1d1d', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}