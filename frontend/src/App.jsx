// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PmPartMonitoringPage from './pages/PmPartMonitoringPage';
import PmPartHistoryPage from './pages/PmPartHistoryPage';
import PmLineStatusPage from './pages/PmLineStatusPage';
import PmLineHistoryPage from './pages/PmLineHistoryPage';
import MasterDataPage from './pages/MasterDataPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pm-part" element={<PmPartMonitoringPage />} />
          <Route path="/pm-part/history" element={<PmPartHistoryPage />} />
          <Route path="/pm-line" element={<PmLineStatusPage />} />
          <Route path="/pm-line/history" element={<PmLineHistoryPage />} />
          <Route path="/master-data" element={<MasterDataPage />} />

          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
