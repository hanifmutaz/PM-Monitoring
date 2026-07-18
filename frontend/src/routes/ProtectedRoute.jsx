// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * @param {string[]} [allowedRoles] - kalau diisi, cuma role ini yang boleh
 * lewat (mis. ['Admin'] buat Settings & User Management - UI Spec §3.2).
 * Backend TETAP jadi penegak utama (Dev Rules §12) - ini cuma UX, sembunyiin
 * menu/route yang emang gak bisa diakses dari sisi tampilan.
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="caption" style={{ padding: 32 }}>Memuat sesi...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
