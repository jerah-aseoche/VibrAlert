import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PublicLogs from "./pages/PublicLogs";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import DetectionLogs from "./pages/DetectionLogs";
import ManualControl from "./pages/ManualControl";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <Router>
    <Routes>
      {/* Default route - Read-only public logs (no login required) */}
      <Route path="/" element={<PublicLogs />} />
      
      {/* Admin login page */}
      <Route path="/admin-login" element={<AdminLogin />} />
      
      {/* Protected admin routes (require login) */}
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
      
      {/* Fallback - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;