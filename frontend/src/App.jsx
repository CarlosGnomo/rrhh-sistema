import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Honorarios from './pages/Honorarios';
import Jefaturas from './pages/Jefaturas';
import Login from './pages/Login';
import FormularioExterno from './pages/FormularioExterno';
import Juicios from './pages/Juicios';

// ─── Rutas protegidas ────────────────────────────────────────────────────────
function RutaProtegida({ children, soloAdmin }) {
  const { user, perfil, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#60a5fa', fontSize: 14 }}>Cargando...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (soloAdmin && perfil?.rol !== 'admin') return <Navigate to="/jefaturas" />;

  return children;
}

// ─── Layout con menú filtrado por rol ────────────────────────────────────────
function Layout({ children }) {
  const { perfil, logout } = useAuth();
  const esAdmin = perfil?.rol === 'admin';

  const menuItems = esAdmin
    ? [
        { to: '/',           label: 'Resumen general' },
        { to: '/honorarios', label: 'Honorarios' },
        { to: '/jefaturas',  label: 'Jefaturas' },
        { to: '/juicios',    label: 'Juicios y sanciones' },
        { to: '/informe',    label: 'Informe' },
      ]
    : [
        { to: '/jefaturas',  label: 'Jefaturas' },
      ];

  return (
    <div style={{ background: '#eef2e6', minHeight: '100vh' }}>
      <nav style={{
        background: '#3d5016',
        borderBottom: '0.5px solid #2e3d10',
        padding: '10px 20px',
        display: 'flex', gap: '8px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            background: '#4a5e2a', color: '#e8f0d8', borderRadius: '6px',
            padding: '4px 10px', fontSize: '12px', marginRight: '8px',
            fontWeight: 700, border: '1px solid #6a8a3a'
          }}>RRHH Central</span>

          {menuItems.map(({ to, label }) => (
            <NavLink key={to} to={to} end style={({ isActive }) => ({
              padding: '7px 13px', fontSize: '12px', borderRadius: '6px',
              textDecoration: 'none', border: '0.5px solid transparent',
              color: isActive ? '#fff' : '#c8d5a8',
              background: isActive ? '#4a5e2a' : 'transparent',
              borderColor: isActive ? '#6a8a3a' : 'transparent',
              fontWeight: isActive ? 600 : 400,
            })}>{label}</NavLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#c8d5a8' }}>
            {perfil?.nombre} ·{' '}
            <span style={{ color: '#e8f0d8', fontWeight: 600 }}>
              {esAdmin ? perfil?.rol : perfil?.area}
            </span>
          </span>
          <button onClick={logout} style={{
            background: 'transparent', border: '0.5px solid #f87171',
            borderRadius: 6, padding: '5px 12px', fontSize: 12,
            color: '#f87171', cursor: 'pointer'
          }}>Cerrar sesión</button>
        </div>
      </nav>

      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

// ─── App con rutas ────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/ingresar-honorario" element={<FormularioExterno />} />

          <Route path="/" element={
            <RutaProtegida soloAdmin>
              <Layout><Dashboard /></Layout>
            </RutaProtegida>
          } />
          <Route path="/honorarios" element={
            <RutaProtegida soloAdmin>
              <Layout><Honorarios /></Layout>
            </RutaProtegida>
          } />
<Route path="/juicios" element={
  <RutaProtegida soloAdmin>
    <Layout><Juicios /></Layout>
  </RutaProtegida>
          } />
          <Route path="/informe" element={
            <RutaProtegida soloAdmin>
              <Layout>
                <div style={{ color: '#4a5568' }}>Informe — en construcción</div>
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/jefaturas" element={
            <RutaProtegida>
              <Layout><Jefaturas /></Layout>
            </RutaProtegida>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;