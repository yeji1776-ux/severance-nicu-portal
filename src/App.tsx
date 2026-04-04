import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import AdminEditor from './pages/AdminEditor';
import DischargeManual from './pages/DischargeManual';
import NotificationCenter from './pages/admin/NotificationCenter';
import AdmissionConfirmations from './pages/admin/AdmissionConfirmations';
import ScreenCaptureWarning from './components/ScreenCaptureWarning';
import CaptureNoticeModal from './components/CaptureNoticeModal';
import Watermark from './components/Watermark';

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <CaptureNoticeModal />
      <ScreenCaptureWarning />
      <Watermark />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* 진료과별 라우트 */}
          <Route path="/dept/:deptSlug/dashboard" element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dept/:deptSlug/manual" element={
            <ProtectedRoute role="parent">
              <DischargeManual />
            </ProtectedRoute>
          } />

          {/* 하위호환 리다이렉트 */}
          <Route path="/dashboard" element={<Navigate to="/dept/nicu/dashboard" replace />} />
          <Route path="/manual" element={<Navigate to="/dept/nicu/manual" replace />} />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute role="admin">
              <NotificationCenter />
            </ProtectedRoute>
          } />
          <Route path="/admin/confirmations" element={
            <ProtectedRoute role="admin">
              <AdmissionConfirmations />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
