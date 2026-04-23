import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLogs from "./pages/PublicLogs";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import DetectionLogs from "./pages/DetectionLogs";
import ManualControl from "./pages/ManualControl";
import QRManagement from "./pages/QRManagement";
import QRLogin from "./pages/QRLogin";  // ← MUST HAVE THIS IMPORT
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLogs />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/qr-login" element={<QRLogin />} />  {/* ← MUST HAVE THIS ROUTE */}
        <Route path="/qr" element={<ProtectedRoute><QRManagement /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/detect" element={<ProtectedRoute><DetectionLogs /></ProtectedRoute>} />
        <Route path="/control" element={<ProtectedRoute><ManualControl /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;