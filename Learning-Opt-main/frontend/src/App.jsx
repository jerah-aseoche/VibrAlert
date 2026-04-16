import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PublicLogs from "./pages/PublicLogs";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import DetectionLogs from "./pages/DetectionLogs";
import ManualControl from "./pages/ManualControl";
import ProtectedRoute from "./components/ProtectedRoute";
import QRManagement from "./pages/QRManagement";
import QRLogin from "./pages/QRLogin";  // New component

const App = () => (
  <Router>
    <Routes>
      {/* Default route - Read-only public logs */}
      <Route path="/" element={<PublicLogs />} />
      
      {/* QR Login handler - redirects to dashboard with token */}
      <Route path="/qr-login" element={<QRLogin />} />
      
      {/* Admin login page */}
      <Route path="/admin-login" element={<AdminLogin />} />
      
      {/* QR Generator (Admin only) */}
      <Route path="/qr" element={
        <ProtectedRoute>
          <QRManagement />
        </ProtectedRoute>
      } />
      
      {/* Protected admin routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      
      <Route path="/detect" element={
        <ProtectedRoute>
          <DetectionLogs />
        </ProtectedRoute>
      } />
      
      <Route path="/control" element={
        <ProtectedRoute>
          <ManualControl />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;