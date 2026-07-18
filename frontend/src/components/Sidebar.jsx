// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

function NavItem({ to, children, badgeCount }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <span>{children}</span>
      {badgeCount > 0 && <span className="nav-item-badge">{badgeCount}</span>}
    </NavLink>
  );
}

function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { data: summary } = useDashboardSummary();

  return (
    <aside className="sidebar">
      <div className="brand-mark-row">
        <div className="brand-mark">H</div>
        <div>
          <div className="brand-text-title">PM Monitor</div>
          <div className="brand-text-sub">Hirose Internal</div>
        </div>
      </div>

      <nav className="nav-scroll">
        <NavItem to="/">Dashboard</NavItem>

        <div className="nav-group-label">PM Part</div>
        <NavItem to="/pm-part" badgeCount={summary?.status_danger}>
          Monitoring Part
        </NavItem>
        <NavItem to="/pm-part/history">History Penggantian</NavItem>

        <div className="nav-group-label">PM Line</div>
        <NavItem to="/pm-line" badgeCount={summary?.lines_critical}>
          Monthly & Weekly
        </NavItem>
        <NavItem to="/pm-line/history">History PM Line</NavItem>

        <div className="nav-group-label">Data</div>
        <NavItem to="/master-data">Master Data</NavItem>

        {isAdmin && (
          <>
            <div className="nav-group-label">Administrasi</div>
            <NavItem to="/settings">Settings</NavItem>
            <NavItem to="/users">User Management</NavItem>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.full_name}</div>
        <div className="sidebar-user-role">{user?.role}</div>
        <button type="button" className="sidebar-logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
