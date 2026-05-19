import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Honorarios from './pages/Honorarios';
import Jefaturas from './pages/Jefaturas';
import Login from './pages/Login';

function RutaProtegida({ children, rolRequerido }) {
  const { user, perfil, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#60a5fa', fontSize: 14 }}>Cargando...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (rolRequerido && perfil?.rol !== rolRequerido && perfil?.rol !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
}

function Layout({ children }) {
  const { perfil, logout } = useAuth();
  return (
    <div style={{ background: '#0f1117', minHeight: '100vh' }}>
      <nav style={{
        background: '#1a1f2e', borderBottom: '0.5px solid #2a3245',
        padding: '10px 20px', display: 'flex', gap: '8px',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            })}>{label}</NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {perfil?.nombre} · <span style={{ color: '#a78bfa' }}>{perfil?.rol}</span>
          </span>
          <button onClick={logout} style={{
            background: 'transparent', border: '0.5px solid #2a3245',
            borderRadius: 6, padding: '5px 12px', fontSize: 12,
            color: '#f87171', cursor: 'pointer'
          }}>Cerrar sesión</button>
        </div>
      </nav>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Layout><Dashboard /></Layout></RutaProtegida>} />
          <Route path="/honorarios" element={<RutaProtegida><Layout><Honorarios /></Layout></RutaProtegida>} />
          <Route path="/jefaturas" element={<RutaProtegida rolRequerido="jefatura"><Layout><Jefaturas /></Layout></RutaProtegida>} />
          <Route path="/juicios" element={<RutaProtegida><Layout><div style={{color:'#94a3b8'}}>Juicios y sanciones — en construcción</div></Layout></RutaProtegida>} />
          <Route path="/informe" element={<RutaProtegida><Layout><div style={{color:'#94a3b8'}}>Informe — en construcción</div></Layout></RutaProtegida>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;