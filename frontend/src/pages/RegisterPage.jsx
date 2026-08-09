// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { register } from '../api/authApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const emptyForm = { username: '', full_name: '', email: '', password: '', confirmPassword: '' };

// Brand mark & layout SENGAJA sama persis gaya-nya kayak LoginPage.jsx
// (biar konsisten antara 2 halaman auth), tapi ditulis independen - gak ada
// shared component baru yang diekstrak, karena cuma dipakai di 2 tempat ini.
// Semua logic validasi/submit PERSIS SAMA kayak sebelumnya.
function AuthShell({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: 'radial-gradient(circle at 50% 0%, var(--accent-dim), transparent 60%)' }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
            H
          </div>
          <div>
            <div className="[font-family:var(--font-display)] text-lg font-semibold text-foreground">
            PM Monitor
          </div>
            <div className="text-sm text-muted-foreground">Hirose Internal</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <span className="text-xs text-destructive">{message}</span>;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <AuthShell>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ok-dim text-ok">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="[font-family:var(--font-display)] text-base font-semibold text-foreground">
            Registrasi berhasil
          </div>
          <p className="text-sm text-muted-foreground">
            Akun Anda sudah dibuat dan sedang menunggu persetujuan Admin. Anda akan bisa login setelah disetujui.
          </p>
          <Button type="button" className="w-full" onClick={() => navigate('/login')}>
            Kembali ke Login
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-2xl"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            autoFocus
            required
          />
          <FieldError message={errors.username} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            autoComplete="name"
            required
          />
          <FieldError message={errors.full_name} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email (opsional)</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={errors.password} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            autoComplete="new-password"
            required
          />
          <FieldError message={errors.confirmPassword} />
        </div>

        {errors._general && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors._general}
          </div>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Mendaftar...' : 'Daftar'}
        </Button>

        <Link
          to="/login"
          className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sudah punya akun? <span className="text-primary">Login di sini</span>
        </Link>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
