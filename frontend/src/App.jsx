import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Honorarios from './pages/Honorarios';
import Jefaturas from './pages/Jefaturas';
import Login from './pages/Login';
import FormularioExterno from './pages/FormularioExterno';

// ─── Rutas protegidas ────────────────────────────────────────────────────────
function RutaProtegida({ children, soloAdmin }) {
  const { user, perfil, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#60a5fa', fontSize: 14 }}>Cargando...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  // Si la ruta es solo para admin y el usuario no lo es, redirige
  if (soloAdmin && perfil?.rol !== 'admin') return <Navigate to="/jefaturas" />;

  return children;
}

// ─── Layout con menú filtrado por rol ────────────────────────────────────────
function Layout({ children }) {
  const { perfil, logout } = useAuth();
  const esAdmin = perfil?.rol === 'admin';

  // Menú según rol:
  // admin      → ve todo
  // jefatura   → solo ve Jefaturas
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

          {menuItems.map(({ to, label }) => (
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
          {/* Muestra área si es jefatura, rol si es admin */}
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {perfil?.nombre} ·{' '}
            <span style={{ color: '#a78bfa' }}>
              {esAdmin ? perfil?.rol : perfil?.area}
            </span>
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

// ─── App con rutas ────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/ingresar-honorario" element={<FormularioExterno />} />

          {/* Rutas solo admin */}
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
              <Layout>
                <div style={{ color: '#94a3b8' }}>Juicios y sanciones — en construcción</div>
              </Layout>
            </RutaProtegida>
          } />
          <Route path="/informe" element={
            <RutaProtegida soloAdmin>
              <Layout>
                <div style={{ color: '#94a3b8' }}>Informe — en construcción</div>
              </Layout>
            </RutaProtegida>
          } />

          {/* Ruta jefatura — accesible para admin y jefatura */}
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