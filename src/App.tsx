import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Painel = lazy(() => import('./components/Painel').then(module => ({ default: module.Painel })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then(module => ({ default: module.ClientsPage })));
const FinancePage = lazy(() => import('./pages/FinancePage').then(module => ({ default: module.FinancePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const IAPage = lazy(() => import('./pages/IAPage').then(module => ({ default: module.IAPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage').then(module => ({ default: module.DocumentsPage })));
const PerformancePage = lazy(() => import('./pages/PerformancePage').then(module => ({ default: module.PerformancePage })));
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#B9FF66] border-t-transparent animate-spin"></div>
          <span className="text-[#B9FF66]/50 text-[10px] font-bold uppercase tracking-widest">Carregando Módulos...</span>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<OnboardingPage />} />

          {/* Protected Routes */}
          <Route path="/painel" element={<ProtectedRoute><Painel /></ProtectedRoute>} />
          <Route path="/ia" element={<ProtectedRoute><IAPage /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/documentos/:type/:id" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
