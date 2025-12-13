import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './utils/auth';
import Home from './pages/Home';
import DetectionLogs from './pages/DetectionLogs';  
import ManualControl from './pages/ManualControl';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/detect" element={<PrivateRoute><DetectionLogs /></PrivateRoute>} />
        <Route path="/control" element={<PrivateRoute><ManualControl /></PrivateRoute>} />
        <Route path="/tesda" element={<PrivateRoute><TESDAPage /></PrivateRoute>} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
