// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';

const emptyForm = { username: '', full_name: '', email: '', password: '', confirmPassword: '' };

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Konfirmasi password tidak sama' });
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: form.username,
        full_name: form.full_name,
        email: form.email || undefined,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setErrors(err.response?.data?.errors || { _general: err.response?.data?.message || 'Gagal mendaftar' });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="panel" style={{ width: 380, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Registrasi berhasil</div>
          <p className="caption" style={{ marginBottom: 20 }}>
            Akun Anda sudah dibuat dan sedang menunggu persetujuan Admin. Anda akan bisa login setelah disetujui.
          </p>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <form onSubmit={handleSubmit} className="panel" style={{ width: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-text-title">PM Monitor</div>
            <div className="brand-text-sub">Daftar Akun Baru</div>
          </div>
        </div>

        <label className="form-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          autoComplete="username"
          required
        />
        {errors.username && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.username}</span>}

        <label className="form-label" htmlFor="full_name">
          Nama Lengkap
        </label>
        <input
          id="full_name"
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        {errors.full_name && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.full_name}</span>}

        <label className="form-label" htmlFor="email">
          Email (untuk notifikasi)
        </label>
        <input
          id="email"
          type="email"
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.email}</span>}

        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          required
        />
        {errors.password && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.password}</span>}

        <label className="form-label" htmlFor="confirmPassword">
          Konfirmasi Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="form-input"
          style={{ width: '100%', marginBottom: 16 }}
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.confirmPassword}</span>}

        {errors._general && (
          <div className="error-state" style={{ marginBottom: 16, padding: 10, fontSize: 13, textAlign: 'left' }}>
            {errors._general}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} disabled={submitting}>
          {submitting ? 'Mendaftar...' : 'Daftar'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className="caption">
            Sudah punya akun? Login di sini
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
