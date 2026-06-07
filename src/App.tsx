import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/Dashboard';
import { Antrian } from './pages/rsud/Antrian';
import { Dokter } from './pages/rsud/Dokter';
import { Harga } from './pages/bapok/Harga';
import { Alert } from './pages/bapok/Alert';
import { Acara } from './pages/islamic/Acara';
import { Booking } from './pages/islamic/Booking';
import { Tiket } from './pages/transjatim/Tiket';
import { Armada } from './pages/transjatim/Armada';
import { Users } from './pages/auth/Users';
import { ROUTES } from './constants/routes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.RSUD_ANTRIAN} element={<Antrian />} />
          <Route path={ROUTES.RSUD_DOKTER} element={<Dokter />} />
          <Route path={ROUTES.BAPOK_HARGA} element={<Harga />} />
          <Route path={ROUTES.BAPOK_ALERT} element={<Alert />} />
          <Route path={ROUTES.ISLAMIC_ACARA} element={<Acara />} />
          <Route path={ROUTES.ISLAMIC_BOOKING} element={<Booking />} />
          <Route path={ROUTES.TRANSJATIM_TIKET} element={<Tiket />} />
          <Route path={ROUTES.TRANSJATIM_ARMADA} element={<Armada />} />
          <Route path={ROUTES.AUTH_USERS} element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
