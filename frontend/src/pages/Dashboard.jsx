import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, LabelList
} from 'recharts';

const VERDE       = '#4a5e2a';
const VERDE_CLARO = '#f0f4e8';
const FONDO       = '#eef2e6';
const BORDE       = '#c8d5a8';
const TEXTO       = '#4a5568';
const API_URL     = import.meta.env.VITE_API_URL || 'https://rrhh-sistema-production.up.railway.app';

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

export default function Dashboard() {
  const [honorarios, setHonorarios]     = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [juicios, setJuicios]           = useState([]);
  const [sanciones, setSanciones]       = useState([]);
  const [acuerdos, setAcuerdos]         = useState([]);
  const [dotacion, setDotacion]         = useState(null);
  const [remuneraciones, setRemuneraciones] = useState(null);
  const [loadingBuk, setLoadingBuk]     = useState(true);
  const [loadingRem, setLoadingRem]     = useState(true);
  const [loading, setLoading]           = useState(true);
  const [verContratos, setVerContratos] = useState(false);

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
    async function cargarBuk() {
      try {
        const res  = await fetch(`${API_URL}/buk/dotacion`);
        const data = await res.json();
        setDotacion(data);
      } catch (e) {
        setDotacion(null);
      } finally {
        setLoadingBuk(false);
      }
    }
    async function cargarRemuneraciones() {
      try {
        const res  = await fetch(`${API_URL}/buk/remuneraciones`);
        const data = await res.json();
        setRemuneraciones(data);
      } catch (e) {
        setRemuneraciones(null);
      } finally {
        setLoadingRem(false);
      }
    }
    cargar();
    cargarBuk();
    cargarRemuneraciones();
  }, []);

  const mesActual      = new Date().getMonth();
  const anioActual     = new Date().getFullYear();
  const honMes         = honorarios.filter(h => {
    const f = new Date(h.fecha_ingreso);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  });
  const pendientes     = honorarios.filter(h => h.estado === 'Pendiente' || h.estado === 'En revision');
  const aprobados      = honorarios.filter(h => h.estado === 'Aprobado');
  const rechazados     = honorarios.filter(h => h.estado === 'Rechazado');
  const montoAprobado  = aprobados.reduce((s, h) => s + h.monto_liquido, 0);
  const montoPendiente = pendientes.reduce((s, h) => s + h.monto_liquido, 0);
  const presupTotal    = presupuestos.reduce((s, p) => s + (p.presupuesto_anual || 0), 0);
  const consumido      = aprobados.reduce((s, h) => s + h.monto_liquido, 0);
  const pctEjecutado   = presupTotal > 0 ? ((consumido / presupTotal) * 100).toFixed(1) : 0;

  const porArea = honorarios.reduce((acc, h) => {
    if (!acc[h.area]) acc[h.area] = { aprobado: 0, pendiente: 0 };
    if (h.estado === 'Aprobado') acc[h.area].aprobado += h.monto_liquido;
    if (h.estado === 'Pendiente' || h.estado === 'En revision') acc[h.area].pendiente += h.monto_liquido;
    return acc;
  }, {});
  const dataArea = Object.entries(porArea).map(([area, v]) => ({
    area: area.length > 12 ? area.slice(0, 12) + '...' : area,
    aprobado: Math.round(v.aprobado / 1000),
    pendiente: Math.round(v.pendiente / 1000),
  }));

  const dataEstado = [
    { name: 'Aprobadas', value: aprobados.length },
    { name: 'Pendientes', value: pendientes.length },
    { name: 'Rechazadas', value: rechazados.length },
  ].filter(d => d.value > 0);
  const COLORES_ESTADO = ['#16a34a', '#d97706', '#dc2626'];

  const juiciosActivos  = juicios.filter(j => j.estado !== 'Cerrado');
  const montoRiesgo     = juiciosActivos.reduce((s, j) => s + (j.monto_demanda || 0), 0);
  const hoy             = new Date();
  const proxAudiencias  = juicios
    .flatMap(j => (j.fechas_audiencias || []).map(f => ({ ...j, proxFecha: new Date(f + 'T12:00:00') })))
    .filter(j => j.proxFecha >= hoy)
    .sort((a, b) => a.proxFecha - b.proxFecha)
    .slice(0, 5);
  const leyKarinActivos = acuerdos.filter(a => a.tipo === 'Ley Karin' && a.estado === 'En investigacion');

  const pendientesPorArea = pendientes.reduce((acc, h) => {
    if (!acc[h.area]) acc[h.area] = { cantidad: 0, monto: 0 };
    acc[h.area].cantidad++;
    acc[h.area].monto += h.monto_liquido;
    return acc;
  }, {});
  const pendientesTabla = Object.entries(pendientesPorArea).sort((a, b) => b[1].monto - a[1].monto);

  const dataDotacionArea = dotacion
    ? Object.entries(dotacion.por_area)
        .sort((a, b) => b[1].masa_bruta - a[1].masa_bruta)
        .map(([area, v]) => ({
          area: area.length > 14 ? area.slice(0, 14) + '...' : area,
          dotacion: v.dotacion,
          masa: Math.round(v.masa_bruta / 1000000 * 10) / 10,
        }))
    : [];

  // Datos para grafico sueldo liquido / costo empresa (valores completos en pesos)
  const dataTendenciaRem = remuneraciones
    ? remuneraciones.historico_3_meses.map(m => ({
        mes: m.mes,
        liquido: m.sueldoLiquido,
        costoEmpresa: m.costoEmpresa,
      }))
    : [];

  // Datos para grafico leyes sociales por mes (valores completos en pesos)
  const dataLeyesSociales = remuneraciones
    ? remuneraciones.historico_3_meses.map(m => ({
        mes: m.mes,
        leyesSociales: m.leyesSociales,
      }))
    : [];

  if (loading) return (
    <div style={{ background: FONDO, minHeight: 'calc(100vh - 60px)', margin: '-20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: VERDE, fontSize: 14 }}>Cargando datos...</div>
    </div>
  );

  return (
    <div style={{ background: FONDO, minHeight: 'calc(100vh - 60px)', margin: '-20px', padding: '20px' }}>

      {/* BLOQUE 1: Remuneraciones y dotacion (BUK) */}
      <div style={secLabel}>Remuneraciones y dotacion</div>

      {/* ── Sueldo liquido + Costo empresa + Leyes sociales ── */}
      {loadingRem ? (
        <div style={{ ...card, textAlign: 'center', color: VERDE, fontSize: 12, padding: 24 }}>Cargando remuneraciones...</div>
      ) : remuneraciones ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* Cuadro 1: Sueldo liquido + Costo empresa */}
          <div style={card}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Sueldo liquido ({remuneraciones.mes_actual.mes})</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: VERDE, marginBottom: 10 }}>
                ${remuneraciones.mes_actual.sueldoLiquido.toLocaleString('es-CL')}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="65%" height={150} minWidth={220}>
                <BarChart data={dataTendenciaRem} margin={{ top: 28, right: 8, left: 8, bottom: 0 }} barCategoryGap="35%">
                  <defs>
                    <linearGradient id="gradLiquido" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3c4d20" />
                      <stop offset="50%" stopColor={VERDE} />
                      <stop offset="100%" stopColor="#7a9c4e" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fill: TEXTO, fontSize: 10 }} axisLine={{ stroke: BORDE }} tickLine={false} />
                  <YAxis hide domain={[0, dataMax => Math.ceil(dataMax * 1.35)]} />
                  <Tooltip
                    formatter={v => [`$${Math.round(v).toLocaleString('es-CL')}`, 'Sueldo liquido']}
                    contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="liquido" name="liquido" fill="url(#gradLiquido)" radius={[5, 5, 1, 1]} maxBarSize={42}
                    style={{ filter: 'drop-shadow(0 3px 3px rgba(74,94,42,0.35))' }}>
                    <LabelList dataKey="liquido" position="top" content={({ x, y, value }) => (
                      <text x={x} y={y - 6} fill={VERDE} fontSize={11} fontWeight={700} textAnchor="middle">
                        {`$${Math.round(value).toLocaleString('es-CL')}`}
                      </text>
                    )} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid ' + BORDE }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Costo empresa ({remuneraciones.mes_actual.mes})</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: VERDE, marginBottom: 10 }}>
                ${remuneraciones.mes_actual.costoEmpresa.toLocaleString('es-CL')}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="65%" height={150} minWidth={220}>
                <BarChart data={dataTendenciaRem} margin={{ top: 28, right: 8, left: 8, bottom: 0 }} barCategoryGap="35%">
                  <defs>
                    <linearGradient id="gradCosto" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3c4d20" />
                      <stop offset="50%" stopColor={VERDE} />
                      <stop offset="100%" stopColor="#7a9c4e" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fill: TEXTO, fontSize: 10 }} axisLine={{ stroke: BORDE }} tickLine={false} />
                  <YAxis hide domain={[0, dataMax => Math.ceil(dataMax * 1.35)]} />
                  <Tooltip
                    formatter={v => [`$${Math.round(v).toLocaleString('es-CL')}`, 'Costo empresa']}
                    contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="costoEmpresa" name="costoEmpresa" fill="url(#gradCosto)" radius={[5, 5, 1, 1]} maxBarSize={42}
                    style={{ filter: 'drop-shadow(0 3px 3px rgba(74,94,42,0.35))' }}>
                    <LabelList dataKey="costoEmpresa" position="top" content={({ x, y, value }) => (
                      <text x={x} y={y - 6} fill={VERDE} fontSize={11} fontWeight={700} textAnchor="middle">
                        {`$${Math.round(value).toLocaleString('es-CL')}`}
                      </text>
                    )} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cuadro 2: Leyes sociales */}
          <div style={card}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Leyes sociales ({remuneraciones.mes_actual.mes})</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: VERDE }}>
                ${remuneraciones.mes_actual.leyesSociales.toLocaleString('es-CL')}
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Cotizaciones previsionales y de salud descontadas a colaboradores
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="70%" height={190} minWidth={220}>
                <BarChart data={dataLeyesSociales} margin={{ top: 28, right: 8, left: 8, bottom: 0 }} barCategoryGap="35%">
                  <defs>
                    <linearGradient id="gradLeyes" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3c4d20" />
                      <stop offset="50%" stopColor={VERDE} />
                      <stop offset="100%" stopColor="#7a9c4e" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fill: TEXTO, fontSize: 10 }} axisLine={{ stroke: BORDE }} tickLine={false} />
                  <YAxis hide domain={[0, dataMax => Math.ceil(dataMax * 1.35)]} />
                  <Tooltip
                    formatter={v => [`$${Math.round(v).toLocaleString('es-CL')}`, 'Leyes sociales']}
                    contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="leyesSociales" name="leyesSociales" fill="url(#gradLeyes)" radius={[5, 5, 1, 1]} maxBarSize={42}
                    style={{ filter: 'drop-shadow(0 3px 3px rgba(74,94,42,0.35))' }}>
                    <LabelList dataKey="leyesSociales" position="top" content={({ x, y, value }) => (
                      <text x={x} y={y - 6} fill={VERDE} fontSize={11} fontWeight={700} textAnchor="middle">
                        {`$${Math.round(value).toLocaleString('es-CL')}`}
                      </text>
                    )} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, border: '1px dashed ' + BORDE, background: VERDE_CLARO, textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 12, color: '#888' }}>No se pudo conectar con Buk para remuneraciones.</div>
        </div>
      )}

      {/* ── Dotacion, masa salarial por area, contratos vencen ── */}
      {loadingBuk ? (
        <div style={{ ...card, textAlign: 'center', color: VERDE, fontSize: 12, padding: 24 }}>Cargando dotacion...</div>
      ) : dotacion ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <KPI label="Dotacion activa total" value={dotacion.dotacion_total} sub="Colaboradores activos en Buk" color={VERDE} />
            <KPI label="Finiquitos este mes" value={dotacion.finiquitos_mes} sub="Colaboradores con salida en el mes" color={dotacion.finiquitos_mes > 3 ? '#dc2626' : '#d97706'} alerta={dotacion.finiquitos_mes > 5 ? '#dc2626' : null} />
            <KPI label="Contratos vencen en 30 dias" value={dotacion.contratos_vencen_30_dias} sub="Requieren revision o renovacion" color={dotacion.contratos_vencen_30_dias > 5 ? '#dc2626' : '#d97706'} alerta={dotacion.contratos_vencen_30_dias > 10 ? '#dc2626' : null} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: VERDE, marginBottom: 14 }}>Masa salarial bruta por area (MM$)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dataDotacionArea} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="area" tick={{ fill: TEXTO, fontSize: 10 }} />
                  <YAxis tickFormatter={v => `$${v}M`} tick={{ fill: TEXTO, fontSize: 10 }} />
                  <Tooltip
                    formatter={(v, name) => [name === 'masa' ? `$${v}M` : v, name === 'masa' ? 'Masa bruta' : 'Dotacion']}
                    contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="masa" name="masa" fill={VERDE} radius={[4, 4, 0, 0]}
                    label={{ position: 'top', fill: TEXTO, fontSize: 10, formatter: v => v > 0 ? `$${v}M` : '' }} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 10, color: '#888', marginTop: 6 }}>
                * Calculado con sueldo base contractual de cada colaborador activo, agrupado por centro de costo (no incluye gratificacion, bonos ni horas extra).
              </div>
            </div>

            <div style={card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: VERDE, marginBottom: 10 }}>Dotacion por area</div>
              <div style={{ overflowY: 'auto', maxHeight: 200 }}>
                {dataDotacionArea.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid ' + BORDE, fontSize: 12 }}>
                    <span style={{ color: TEXTO }}>{d.area}</span>
                    <span style={{ fontWeight: 700, color: VERDE }}>{d.dotacion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contratos que vencen - DESPLEGABLE */}
          {dotacion.detalle_contratos_vencen.length > 0 && (
            <div style={card}>
              <div
                onClick={() => setVerContratos(!verContratos)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Contratos que vencen en los proximos 30 dias ({dotacion.contratos_vencen_30_dias})
                </div>
                <span style={{ fontSize: 12, color: VERDE, fontWeight: 600 }}>
                  {verContratos ? 'Ocultar ▲' : 'Ver detalle ▼'}
                </span>
              </div>
              {verContratos && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 12 }}>
                  <thead>
                    <tr>{['Colaborador', 'Area', 'Tipo contrato', 'Vence'].map(h => (
                      <th key={h} style={{ textAlign: 'left', color: TEXTO, padding: '6px 10px', borderBottom: '1px solid ' + BORDE, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {dotacion.detalle_contratos_vencen.map((c, i) => (
                      <tr key={i}>
                        <td style={{ padding: '6px 10px', fontWeight: 500, borderBottom: '1px solid ' + BORDE }}>{c.nombre}</td>
                        <td style={{ padding: '6px 10px', color: TEXTO, borderBottom: '1px solid ' + BORDE }}>{c.area}</td>
                        <td style={{ padding: '6px 10px', color: TEXTO, borderBottom: '1px solid ' + BORDE }}>{c.tipo}</td>
                        <td style={{ padding: '6px 10px', color: '#dc2626', fontWeight: 700, borderBottom: '1px solid ' + BORDE }}>
                          {new Date(c.vence).toLocaleDateString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ ...card, border: '1px dashed ' + BORDE, background: VERDE_CLARO, textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 12, color: '#888' }}>No se pudo conectar con Buk. Verifica la API key.</div>
        </div>
      )}

      {/* BLOQUE 2: Honorarios externos */}
      <div style={secLabel}>Honorarios externos</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <KPI label="Boletas pendientes" value={pendientes.length} sub={`$${montoPendiente.toLocaleString('es-CL')} en espera`} color={VERDE} alerta={pendientes.length > 5 ? '#dc2626' : null}/>
        <KPI label="Monto aprobado" value={'$' + (montoAprobado / 1000000).toFixed(1) + 'M'} sub={`${aprobados.length} boletas aprobadas`} color="#16a34a"/>
        <KPI label="Presupuesto ejecutado" value={pctEjecutado + '%'} sub={presupTotal > 0 ? `$${consumido.toLocaleString('es-CL')} de $${presupTotal.toLocaleString('es-CL')}` : 'Sin presupuesto asignado'} color={pctEjecutado > 80 ? '#dc2626' : '#d97706'}/>
        <KPI label="Total boletas ingresadas" value={honorarios.length} sub={`${honMes.length} ingresadas este mes`} color={VERDE}/>
      </div>

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
                <Tooltip formatter={(v, name) => [`$${(v * 1000).toLocaleString('es-CL')}`, name === 'aprobado' ? 'Aprobado' : 'Pendiente']} contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="aprobado" name="Aprobado" fill="#4a5e2a" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: TEXTO, fontSize: 10, formatter: v => v > 0 ? `$${v}k` : '' }}/>
                <Bar dataKey="pendiente" name="Pendiente" fill="#d97706" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: TEXTO, fontSize: 10, formatter: v => v > 0 ? `$${v}k` : '' }}/>
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
                <Pie data={dataEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ value }) => `${value}`} labelLine={false}>
                  {dataEstado.map((_, i) => <Cell key={i} fill={COLORES_ESTADO[i]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid ' + BORDE, borderRadius: 8, fontSize: 12 }}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* BLOQUE 3: Gestion legal */}
      <div style={secLabel}>Gestion legal y disciplinaria</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <KPI label="Juicios activos" value={juiciosActivos.length} sub="Causas en curso" color="#d97706" alerta={juiciosActivos.length > 0 ? '#d97706' : null}/>
        <KPI label="Monto en riesgo" value={montoRiesgo > 0 ? '$' + (montoRiesgo / 1000000).toFixed(1) + 'M' : '-'} sub="Suma demandas activas" color="#dc2626"/>
        <KPI label="Sanciones vigentes" value={sanciones.length} sub="Colaboradores con sancion activa" color="#7c3aed" alerta={sanciones.length > 3 ? '#dc2626' : null}/>
        <KPI label="Casos Ley Karin" value={leyKarinActivos.length} sub="En investigacion activa" color="#dc2626" alerta={leyKarinActivos.length > 0 ? '#dc2626' : null}/>
      </div>

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
                      {alerta ? '! ' : ''}{j.proxFecha.toLocaleDateString('es-CL')}
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

      <div style={secLabel}>Boletas pendientes de aprobacion por area</div>
      <div style={card}>
        {pendientesTabla.length === 0 ? (
          <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 20 }}>No hay boletas pendientes.</div>
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