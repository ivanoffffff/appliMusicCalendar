import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ArtistsPage from './pages/ArtistsPage';
import ReleasesPage from './pages/ReleasesPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage'; // 🆕 NOUVEAU
import LoadingSpinner from './components/ui/LoadingSpinner';

// Composant pour protéger les routes privées
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" type="musical" />
          <p className="text-secondary mt-4">Chargement de votre espace musical...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <LoadingSpinner size="xl" type="musical" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function AppContent() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/artists" 
        element={
          <PrivateRoute>
            <ArtistsPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/releases" 
        element={
          <PrivateRoute>
            <ReleasesPage />
          </PrivateRoute>
        } 
      />
      {/* 🆕 NOUVELLE ROUTE - Paramètres de notification */}
      <Route 
        path="/settings/notifications" 
        element={
          <PrivateRoute>
            <NotificationSettingsPage />
          </PrivateRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
