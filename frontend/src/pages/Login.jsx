import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const err = await login(correo, clave);
    if (err) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    } else {
      navigate('/');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1f2e', borderRadius: 12, padding: '40px 36px',
        border: '0.5px solid #2a3245', width: '100%', maxWidth: 400
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            background: '#1a56db', color: '#fff', borderRadius: 8,
            padding: '6px 16px', fontSize: 13, display: 'inline-block', marginBottom: 16
          }}>RRHH Central</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#e2e8f0', margin: 0 }}>
            Iniciar sesión
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#64748b', marginBottom: 6, display: 'block' }}>
              Correo electrónico
            </label>
            <input
              type="email" value={correo} onChange={e => setCorreo(e.target.value)}
              required placeholder="tu@correo.cl"
              style={{
                width: '100%', background: '#0f1117', border: '0.5px solid #2a3245',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e2e8f0',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#64748b', marginBottom: 6, display: 'block' }}>
              Contraseña
            </label>
            <input
              type="password" value={clave} onChange={e => setClave(e.target.value)}
              required placeholder="••••••••"
              style={{
                width: '100%', background: '#0f1117', border: '0.5px solid #2a3245',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e2e8f0',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#450a0a', border: '0.5px solid #7f1d1d',
              borderRadius: 8, padding: '10px 14px', fontSize: 12,
              color: '#f87171', marginBottom: 16
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#1a56db', color: '#fff',
            border: 'none', borderRadius: 8, padding: 13,
            fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Ingresando...' : 'Ingresar al sistema'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 24 }}>
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  );
}