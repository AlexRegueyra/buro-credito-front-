import { lazy, Suspense, useEffect } from 'react';

import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth, ProtectedRoute } from '@features/auth';

import { DashboardLayout } from './layout/DashboardLayout';
import { AppProviders } from './providers';

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import('./pages/errors/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const ConsultaPage = lazy(() => import('./pages/ConsultaPage').then((m) => ({ default: m.ConsultaPage })));
const HistorialPage = lazy(() => import('./pages/HistorialPage').then((m) => ({ default: m.HistorialPage })));

function AuthRedirect() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login')) {
      void navigate('/consulta', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (isAuthenticated) return null;
  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/login" element={<AuthRedirect />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Navigate to="/consulta" replace />} />
          <Route path="/consulta" element={<ConsultaPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

const basename = import.meta.env.VITE_NAME_PROJECT
  ? `/${import.meta.env.VITE_NAME_PROJECT}`
  : '/';

function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AppProviders>
  );
}

export default App;
