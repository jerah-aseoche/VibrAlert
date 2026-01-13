import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DetectionLogs() {
  const navigate = useNavigate();

  const [sensorLogs, setSensorLogs] = useState([]);
  const [bypassLogs, setBypassLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const sensorRes = await axios.get(
        "http://localhost:3000/api/device/sensor-logs"
      );
      const bypassRes = await axios.get(
        "http://localhost:3000/api/device/bypass-logs"
      );

      setSensorLogs(sensorRes.data);
      setBypassLogs(bypassRes.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); // LIVE UPDATE
    return () => clearInterval(interval);
  }, []);

  const goHome = () => {
    navigate("/");
  };

  const logout = () => {
    navigate("/login");
  };

  const clearSensorLogs = async () => {
    await axios.delete("http://localhost:3000/api/device/sensor-logs");
    fetchLogs();
  };

  const clearBypassLogs = async () => {
    await axios.delete("http://localhost:3000/api/device/bypass-logs");
    fetchLogs();
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-white">

      {/* ─── BLURRED BACKGROUND ───────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-sm bg-[#0b3c5d]/70" />

      {/* ─── TOP BAR ─────────────────────────────────────── */}
      <header className="relative z-10 w-full h-14 flex items-center justify-between px-6 bg-white shadow-md">

        <button
          onClick={goHome}
          className="text-black font-semibold hover:text-[#6EB1D6] transition"
        >
          ← Home
        </button>

        {/* Replaced text with banner image */}
        <img
          src="/banner.png"
          alt="Banner"
          className="h-10 object-contain mx-auto"
        />

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-white font-medium transition"
        >
          Logout
        </button>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4">
        {/* SENSOR LOGS */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <h2 className="text-xl font-semibold">Sensor Detection</h2>
            <button
              onClick={clearSensorLogs}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {sensorLogs.map(log => (
              <div
                key={log.id}
                className="border-b border-white/10 py-2 text-sm"
              >
                <p>
                  <strong>{log.event}</strong> — {log.status}
                </p>
                <p className="text-xs opacity-70">
                  {log.details} | {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BYPASS LOGS */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <h2 className="text-xl font-semibold">Bypass / Manual Control</h2>
            <button
              onClick={clearBypassLogs}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {bypassLogs.map(log => (
              <div
                key={log.id}
                className="border-b border-white/10 py-2 text-sm"
              >
                <p>
                  <strong>{log.source.toUpperCase()}</strong> — {log.action} —{" "}
                  {log.status}
                </p>
                <p className="text-xs opacity-70">
                  {log.details} | {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
