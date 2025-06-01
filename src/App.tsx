import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardPage from './pages/DashboardPage';
import LearningPage from './pages/LearningPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import VernacularLearningPage from './pages/VernacularLearningPage';
import AITutorPage from './pages/AITutorPage';
import DigitalBridgePage from './pages/DigitalBridgePage';
import AnalyticsPage from './pages/AnalyticsPage';
import GamificationPage from './pages/GamificationPage';
import Layout from './components/layout/Layout';
import { FocusSessionProvider } from './contexts/FocusSessionContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isExtensionUser, setIsExtensionUser] = useState(false);

  useEffect(() => {
    // Check if user came from extension
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from') === 'extension';
    const extensionAuth = urlParams.get('auth');

    if (fromExtension && extensionAuth) {
      setIsExtensionUser(true);
      // Auto-authenticate extension users
      // This would normally validate the auth token
      console.log('Extension user detected');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading AutoPom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />

      {!isAuthenticated && !isExtensionUser ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/:mode" element={<AuthPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* New Educational Features */}
            <Route path="/vernacular-learning" element={<VernacularLearningPage />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/digital-bridge" element={<DigitalBridgePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/gamification" element={<GamificationPage />} />

            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <FocusSessionProvider>
          <Router>
            <AppContent />
          </Router>
        </FocusSessionProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;