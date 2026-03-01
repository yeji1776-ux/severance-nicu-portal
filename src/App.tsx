import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manual" element={
            <ProtectedRoute role="parent">
              <DischargeManual />
            </ProtectedRoute>
          } />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
