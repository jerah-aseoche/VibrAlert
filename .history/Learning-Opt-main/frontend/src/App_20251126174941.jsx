import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import DetectionLogs from "./pages/DetectionLogs";
import ManualControl from "./pages/ManualControl";
import TESDAPage from "./pages/TESDAPage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      {/* No auth check needed */}
      <Route path="/home" element={<Home />} />
      <Route path="/detect" element={<DetectionLogs />} />
      <Route path="/control" element={<ManualControl />} />
      <Route path="/tesda" element={<TESDAPage />} />
    </Routes>
  </Router>
);

export default App;
