import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import DetectionLogs from "./pages/DetectionLogs";
import ManualControl from "./pages/ManualControl";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/detect" element={<DetectionLogs />} />
      <Route path="/control" element={<ManualControl />} />
    </Routes>
  </Router>
);

export default App;
