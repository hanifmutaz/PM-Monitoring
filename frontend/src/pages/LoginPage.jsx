// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <form onSubmit={handleSubmit} className="panel" style={{ width: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-text-title">PM Monitor</div>
            <div className="brand-text-sub">Hirose Internal</div>
          </div>
        </div>

        <label className="form-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="form-input"
          style={{ width: '100%', marginBottom: 16 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="form-input"
          style={{ width: '100%', marginBottom: 16 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="error-state" style={{ marginBottom: 16, padding: 10, fontSize: 13, textAlign: 'left' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Memproses...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/register" className="caption">
            Belum punya akun? Daftar di sini
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
