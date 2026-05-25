import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const VERDE       = '#4a5e2a';
const VERDE_CLARO = '#f0f4e8';
const FONDO       = '#eef2e6';
const BORDE       = '#c8d5a8';
const TEXTO       = '#4a5568';

const COLORS = ['#4a5e2a','#d97706','#dc2626','#2563eb','#7c3aed','#0891b2','#be185d'];

const card = {
  background: '#fff', borderRadius: 10,
  padding: '16px', border: '1px solid ' + BORDE, marginBottom: 12
};
const kpiCard = {
  background: '#fff', borderRadius: 10,
  padding: '14px 16px', border: '1px solid ' + BORDE
};
const secLabel = {
  fontSize: 11, fontWeight: 700, color: VERDE,
  textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 10px'
};

function KPI({ label, value, sub, color, alerta }) {
  return (
    <div style={{ ...kpiCard, borderLeft: '4px solid ' + (alerta || color) }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: alerta || color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function PlaceholderBUK({ titulo, subtitulo }) {
  return (
    <div style={{ ...card, border: '1px dashed ' + BORDE, background: VERDE_CLARO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: VERDE, marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 11, color: '#888' }}>{subtitulo}</div>
      <div style={{ marginTop: 10, background: BORDE, borderRadius: 999, padding: '3px 12px', fontSize: 11, color: VERDE, fontWeight: 600 }}>Pendiente conexion BUK</div>
    </div>
  );
}

export default function Dashboard() {
  const [honorarios, setHonorarios]     = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [juicios, setJuicios]           = useState([]);
  const [sanciones, setSanciones]       = useState([]);
  const [acuerdos, setAcuerdos]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function cargar() {
      const [h, p, j, s, a] = await Promise.all([
        supabase.from('honorarios').select('area, monto_liquido, estado, fecha_ingreso'),
        supabase.from('presupuestos').select('*').eq('anio', new Date().getFullYear()),
        supabase.from('juicios_laborales').select('*'),
        supabase.from('sanciones_disciplinarias').select('*').eq('estado', 'Vigente'),
        supabase.from('acuerdos_mediaciones').select('*'),
      ]);
      setHonorarios(h.data || []);
      setPresupuestos(p.data || []);
      setJuicios(j.data || []);
      setSanciones(s.data || []);
      setAcuerdos(a.data || []);
      setLoading(false);
    }
    cargar();
  }, []);

  // ── Calculos honorarios
  const mesActual     = new Date().getMonth();
  const anioActual    = new Date().getFullYear();
  const honMes        = honorarios.filter(h => {
    const f = new Date(h.fecha_ingreso);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  });
  const pendientes    = honorarios.filter(h => h.estado === 'Pendiente' || h.estado === 'En revisión');
  const aprobados     = honorarios.filter(h => h.estado === 'Aprobado');
  const rechazados    = honorarios.filter(h => h.estado === 'Rechazado');
  const montoAprobado = aprobados.reduce((s, h) => s + h.monto_liquido, 0);
  const montoPendiente= pendientes.reduce((s, h) => s + h.monto_liquido, 0);

  // Presupuesto total
  const presupTotal   = presupuestos.reduce((s, p) => s + (p.presupuesto_anual || 0), 0);
  const consumido     = aprobados.reduce((s, h) => s + h.monto_liquido, 0);
  const pctEjecutado  = presupTotal > 0 ? ((consumido / presupTotal) * 100).toFixed(1) : 0;

  // Honorarios por area para grafico
  const porArea = honorarios.reduce((acc, h) => {
    if (!acc[h.area]) acc[h.area] = { aprobado: 0, pendiente: 0 };
    if (h.estado === 'Aprobado') acc[h.area].aprobado += h.monto_liquido;
    if (h.estado === 'Pendiente' || h.estado === 'En revisión') acc[h.area].pendiente += h.monto_liquido;
    return acc;
  }, {});
  const dataArea = Object.entries(porArea).map(([area, v]) => ({
    area: area.length > 12 ? area.slice(0, 12) + '…' : area,
    areaFull: area,
    aprobado: Math.round(v.aprobado / 1000),
    pendiente: Math.round(v.pendiente / 1000),
  }));

  // Dona estado boletas
  const dataEstado = [
    { name: 'Aprobadas', value: aprobados.length },
    { name: 'Pendientes', value: pendientes.length },
    { name: 'Rechazadas', value: rechazados.length },
  ].filter(d => d.value > 0);
  const COLORES_ESTADO = ['#16a34a', '#d97706', '#dc2626'];

  // ── Calculos juicios
  const juiciosActivos  = juicios.filter(j => j.estado !== 'Cerrado');
  const montoRiesgo     = juiciosActivos.reduce((s, j) => s + (j.monto_demanda || 0), 0);
  const hoy             = new Date();
  const proxAudiencias  = juicios
    .flatMap(j => (j.fechas_audiencias || []).map(f => ({ ...j, proxFecha: new Date(f + 'T12:00:00') })))
    .filter(j => j.proxFecha >= hoy)
    .sort((a, b) => a.proxFecha - b.proxFecha)
    .slice(0, 5);

  // ── Calculos sanciones y acuerdos
  const leyKarinActivos = acuerdos.filter(a => a.tipo === 'Ley Karin' && a.estado === 'En investigacion');

  // ── Pendientes por area
  const pendientesPorArea = pendientes.reduce((acc, h) => {
    if (!acc[h.area]) acc[h.area] = { cantidad: 0, monto: 0 };
    acc[h.area].cantidad++;
    acc[h.area].monto += h.monto_liquido;
    return acc;
  }, {});
  const pendientesTabla = Object.entries(pendientesPorArea)
    .sort((a, b) => b[1].monto - a[1].monto);

  if (loading) return (
    <div style={{ background: FONDO, minHeight: 'calc(100vh - 60px)', margin: '-20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: VERDE, fontSize: 14 }}>Cargando datos...</div>
    </div>
  );

  return (
    <div style={{ background: FONDO, minHeight: 'calc(100vh - 60px)', margin: '-20px', padding: '20px' }}>

      {/* ── BLOQUE 1 y 2: Placeholders BUK ── */}
      <div style={secLabel}>Remuneraciones y dotacion — pendiente conexion BUK</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 4 }}>
        <PlaceholderBUK titulo="Dotacion y costo laboral" subtitulo="Rem. bruta, neta, leyes sociales, finiquitos"/>
        <PlaceholderBUK titulo="Asistencia y cumplimiento" subtitulo="Ausentismo, horas extras, atrasos"/>
        <PlaceholderBUK titulo="Contratos y vencimientos" subtitulo="Contratos por vencer, renovaciones"/>
      </div>

      {/* ── BLOQUE 3: Honorarios externos ── */}
      <div style={secLabel}>Honorarios externos</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <KPI label="Boletas pendientes" value={pendientes.length} sub={`$${montoPendiente.toLocaleString('es-CL')} en espera`} color={VERDE} alerta={pendientes.length > 5 ? '#dc2626' : null}/>
        <KPI label="Monto aprobado" value={'$' + (montoAprobado / 1000000).toFixed(1) + 'M'} sub={`${aprobados.length} boletas aprobadas`} color="#16a34a"/>
        <KPI label="Presupuesto ejecutado" value={pctEjecutado + '%'} sub={presupTotal > 0 ? `$${consumido.toLocaleString('es-CL')} de $${presupTotal.toLocaleString('es-CL')}` : 'Sin presupuesto asignado'} color={pctEjecutado > 80 ? '#dc2626' : '#d97706'}/>
        <KPI label="Total boletas ingresadas" value={honorarios.length} sub={`${honMes.length} ingresadas este mes`} color={VERDE}/>
      </div>

      {/* ── Graficos honorarios ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: VERDE, marginBottom: 14 }}>Honorarios por area (miles $)</div>
          {dataArea.length === 0 ? (
            <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 20 }}>Sin datos de honorarios aun.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataArea} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="area" tick={{ fill: TEXTO, fontSize: 10 }} />
                <YAxis tickFormatter={v => `$${v}k`} tick={{ fill: TEXTO, fontSize: 10 }} />
                <Tooltip
                  formatter={(v, name) => [`$${(v * 1000).toLocaleString('es-CL')}`, name === 'aprobado' ? 'Aprobado' : 'Pendiente']}
                  contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="aprobado" name="Aprobado" fill="#4a5e2a" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fill: TEXTO, fontSize: 10, formatter: v => v > 0 ? `$${v}k` : '' }}/>
                <Bar dataKey="pendiente" name="Pendiente" fill="#d97706" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fill: TEXTO, fontSize: 10, formatter: v => v > 0 ? `$${v}k` : '' }}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: VERDE, marginBottom: 14 }}>Estado de boletas</div>
          {dataEstado.length === 0 ? (
            <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 20 }}>Sin boletas registradas.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dataEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" label={({ name, value }) => `${value}`} labelLine={false}>
                  {dataEstado.map((_, i) => <Cell key={i} fill={COLORES_ESTADO[i]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── BLOQUE 3: Gestion legal ── */}
      <div style={secLabel}>Gestion legal y disciplinaria</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <KPI label="Juicios activos" value={juiciosActivos.length} sub="Causas en curso" color="#d97706" alerta={juiciosActivos.length > 0 ? '#d97706' : null}/>
        <KPI label="Monto en riesgo" value={montoRiesgo > 0 ? '$' + (montoRiesgo / 1000000).toFixed(1) + 'M' : '-'} sub="Suma demandas activas" color="#dc2626"/>
        <KPI label="Sanciones vigentes" value={sanciones.length} sub="Colaboradores con sancion activa" color="#7c3aed" alerta={sanciones.length > 3 ? '#dc2626' : null}/>
        <KPI label="Casos Ley Karin" value={leyKarinActivos.length} sub="En investigacion activa" color="#dc2626" alerta={leyKarinActivos.length > 0 ? '#dc2626' : null}/>
      </div>

      {/* ── Fila 4a: Proximas audiencias ── */}
      <div style={secLabel}>Proximas audiencias judiciales</div>
      <div style={card}>
        {proxAudiencias.length === 0 ? (
          <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 20 }}>No hay audiencias proximas registradas.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Trabajador', 'Tribunal', 'Tipo demanda', 'Estado', 'Fecha audiencia', 'Dias restantes'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: TEXTO, padding: '8px 10px', borderBottom: '1px solid ' + BORDE, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {proxAudiencias.map((j, i) => {
                const dias = Math.ceil((j.proxFecha - hoy) / (1000 * 60 * 60 * 24));
                const alerta = dias <= 7;
                return (
                  <tr key={i}>
                    <td style={{ padding: '8px 10px', color: '#1a1a1a', fontWeight: 500, borderBottom: '1px solid ' + BORDE }}>{j.nombre_trabajador}</td>
                    <td style={{ padding: '8px 10px', color: TEXTO, borderBottom: '1px solid ' + BORDE }}>{j.tribunal}</td>
                    <td style={{ padding: '8px 10px', color: TEXTO, borderBottom: '1px solid ' + BORDE }}>{j.tipo_demanda}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{j.estado}</span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE, color: alerta ? '#dc2626' : TEXTO, fontWeight: alerta ? 700 : 400, whiteSpace: 'nowrap' }}>
                      {alerta ? '⚠ ' : ''}{j.proxFecha.toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE }}>
                      <span style={{ color: alerta ? '#dc2626' : VERDE, fontWeight: 700 }}>{dias} dias</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Fila 4b: Boletas pendientes por area ── */}
      <div style={secLabel}>Boletas pendientes de aprobacion por area</div>
      <div style={card}>
        {pendientesTabla.length === 0 ? (
          <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 20 }}>No hay boletas pendientes. ✓</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Area', 'Boletas pendientes', 'Monto total pendiente', 'Estado'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: TEXTO, padding: '8px 10px', borderBottom: '1px solid ' + BORDE, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {pendientesTabla.map(([area, v], i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#1a1a1a', fontWeight: 500, borderBottom: '1px solid ' + BORDE }}>{area}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{v.cantidad} pendientes</span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#d97706', fontWeight: 700, borderBottom: '1px solid ' + BORDE }}>${v.monto.toLocaleString('es-CL')}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid ' + BORDE }}>
                    <div style={{ background: BORDE, borderRadius: 6, height: 8, width: '100%', maxWidth: 120 }}>
                      <div style={{ background: v.cantidad > 3 ? '#dc2626' : '#d97706', borderRadius: 6, height: 8, width: Math.min(100, v.cantidad * 20) + '%' }}/>
                    </div>
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