import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardPage from './pages/DashboardPage';
import LearningPage from './pages/LearningPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/layout/Layout';
import FocusSessionContext, { FocusSessionProvider } from './contexts/FocusSessionContext';
import WebSocketContext, { WebSocketProvider } from './contexts/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      <FocusSessionProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/learning" element={<LearningPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </FocusSessionProvider>
    </WebSocketProvider>
  );
}

export default App;