import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const dataRem = [
  { mes: 'Enero', bruto: 85, neto: 68 },
  { mes: 'Febrero', bruto: 88, neto: 70 },
  { mes: 'Marzo', bruto: 91, neto: 72 },
];

const dataCC = [
  { area: 'Operaciones', bruto: 28, neto: 22 },
  { area: 'Administración', bruto: 18, neto: 14 },
  { area: 'Comercial', bruto: 15, neto: 12 },
  { area: 'TI', bruto: 12, neto: 9 },
  { area: 'RRHH', bruto: 8, neto: 6 },
];

const dataHoras = [
  { name: 'Operaciones', value: 145 },
  { name: 'Comercial', value: 98 },
  { name: 'TI', value: 62 },
  { name: 'Admin', value: 41 },
  { name: 'RRHH', value: 18 },
];

const COLORS = ['#8b5cf6','#ec4899','#06b6d4','#f59e0b','#34d399'];

const kpis = [
  { label: 'Rem. bruta total', value: '$91.4M', color: '#60a5fa', sub: '↑ 3.4% vs feb' },
  { label: 'Rem. neta total', value: '$72.1M', color: '#34d399', sub: '↑ 2.9% vs feb' },
  { label: 'Leyes sociales', value: '$16.2M', color: '#fbbf24', sub: '17.7% del bruto' },
  { label: 'Indef. / Plazo fijo', value: '98 / 44', color: '#e2e8f0', sub: '142 trabajadores' },
  { label: 'Honorarios mes', value: '18', color: '#60a5fa', sub: '$6.25M pagados' },
  { label: 'Tiempo completo', value: '78', color: '#34d399', sub: 'jornada 42h' },
  { label: 'Medio tiempo', value: '12', color: '#fbbf24', sub: 'jornada parcial' },
  { label: 'Finiquitos', value: '5', color: '#f87171', sub: '$4.8M monto total' },
];

const card = { background: '#1a1f2e', borderRadius: 10, padding: '14px 16px', border: '0.5px solid #2a3245', marginBottom: 10 };
const label = { fontSize: 11, color: '#64748b', marginBottom: 6 };
const secLabel = { fontSize: 11, fontWeight: 500, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 10px' };

export default function Dashboard() {
  return (
    <div>
      <div style={secLabel}>Indicadores cuantitativos — Marzo 2025</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 16 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#1a1f2e', borderRadius: 8, padding: '12px 14px', border: '0.5px solid #2a3245' }}>
            <div style={label}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 10 }}>Remuneraciones últimos 3 meses</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dataRem} layout="vertical">
              <XAxis type="number" tickFormatter={v => `$${v}M`} tick={{ fill: '#4a5568', fontSize: 11 }} />
              <YAxis type="category" dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} width={55} />
              <Tooltip formatter={v => `$${v}M`} contentStyle={{ background: '#1e2233', border: '0.5px solid #2d3a5a', color: '#e2e8f0' }} />
              <Bar dataKey="bruto" fill="#3b82f6" radius={4} label={{ position: 'right', fill: '#e2e8f0', fontSize: 11, formatter: v => `$${v}M` }} />
              <Bar dataKey="neto" fill="#10b981" radius={4} label={{ position: 'right', fill: '#e2e8f0', fontSize: 11, formatter: v => `$${v}M` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 10 }}>Horas extras por área</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={dataHoras} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, value }) => `${value}h`} labelLine={false}>
                {dataHoras.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `${v} horas`} contentStyle={{ background: '#1e2233', border: '0.5px solid #2d3a5a', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 10 }}>Costo remuneraciones por centro de costo — Marzo 2025</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataCC}>
            <XAxis dataKey="area" tick={{ fill: '#4a5568', fontSize: 10 }} />
            <YAxis tickFormatter={v => `$${v}M`} tick={{ fill: '#4a5568', fontSize: 11 }} />
            <Tooltip formatter={v => `$${v}M`} contentStyle={{ background: '#1e2233', border: '0.5px solid #2d3a5a', color: '#e2e8f0' }} />
            <Bar dataKey="bruto" fill="#38bdf8" radius={4} label={{ position: 'top', fill: '#e2e8f0', fontSize: 11, formatter: v => `$${v}M` }} />
            <Bar dataKey="neto" fill="#a855f7" radius={4} label={{ position: 'top', fill: '#e2e8f0', fontSize: 11, formatter: v => `$${v}M` }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 10 }}>Alertas y pendientes</div>
          {[
            { text: '8 colaboradores sin contrato firmado', sub: 'Vence en menos de 5 días', color: '#f87171' },
            { text: '3 contratos a plazo fijo vencen este mes', sub: 'Requieren renovación o finiquito', color: '#fbbf24' },
            { text: '5 boletas de honorarios sin aprobar', sub: 'Pendiente revisión y pago', color: '#fbbf24' },
            { text: 'Escala de sueldos desactualizada', sub: 'Revisión pendiente por gerencia', color: '#60a5fa' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #2a3245' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>{a.text}</div>
                <div style={{ fontSize: 11, color: '#4a5568' }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 10 }}>Honorarios por área</div>
          {[
            { area: 'TI', desc: 'Desarrollo software', monto: '$2.400.000' },
            { area: 'Operaciones', desc: 'Consultoría', monto: '$1.800.000' },
            { area: 'Comercial', desc: 'Asesoría ventas', monto: '$1.200.000' },
            { area: 'RRHH', desc: 'Capacitación', monto: '$850.000' },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #2a3245' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{h.area} · {h.desc}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#60a5fa' }}>{h.monto}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 6, borderTop: '0.5px solid #2a3245' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Total honorarios marzo</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>$6.250.000</span>
          </div>
        </div>
      </div>
    </div>
  );
}