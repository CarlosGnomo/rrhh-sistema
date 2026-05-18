import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Honorarios from './pages/Honorarios';
import Jefaturas from './pages/Jefaturas';

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#0f1117', minHeight: '100vh' }}>
        <nav style={{
          background: '#1a1f2e', borderBottom: '0.5px solid #2a3245',
          padding: '10px 20px', display: 'flex', gap: '8px',
          alignItems: 'center', flexWrap: 'wrap'
        }}>
          <span style={{
            background: '#1a56db', color: '#fff', borderRadius: '6px',
            padding: '4px 10px', fontSize: '12px', marginRight: '8px'
          }}>RRHH Central</span>

          {[
            { to: '/', label: 'Resumen general' },
            { to: '/honorarios', label: 'Honorarios' },
            { to: '/jefaturas', label: 'Jefaturas' },
            { to: '/juicios', label: 'Juicios y sanciones' },
            { to: '/informe', label: 'Informe' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end style={({ isActive }) => ({
              padding: '7px 13px', fontSize: '12px', borderRadius: '6px',
              textDecoration: 'none', border: '0.5px solid transparent',
              color: isActive ? '#60a5fa' : '#94a3b8',
              background: isActive ? '#1e2233' : 'transparent',
              borderColor: isActive ? '#2d3a5a' : 'transparent'
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/honorarios" element={<Honorarios />} />
            <Route path="/jefaturas" element={<Jefaturas />} />
            <Route path="/juicios" element={<div style={{color:'#94a3b8'}}>Juicios y sanciones — en construcción</div>} />
            <Route path="/informe" element={<div style={{color:'#94a3b8'}}>Informe — en construcción</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;