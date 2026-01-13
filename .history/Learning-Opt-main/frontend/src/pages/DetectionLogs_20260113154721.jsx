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

  const goHome = () => navigate("/home");
  const logout = () => navigate("/login");

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

      {/* ─── HEADER (UNCHANGED) ───────────────────────────── */}
      <header className="relative z-10 w-full h-14 flex items-center justify-between px-6 bg-white shadow-md">
        <button
          onClick={goHome}
          className="text-black font-semibold hover:text-[#6EB1D6] transition"
        >
          ← Home
        </button>

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

      {/* ─── CONTENT ─────────────────────────────────────── */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">

        {/* ─── SENSOR LOGS (VERTICAL / FULL WIDTH) ───────── */}
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Detection – Sensor
            </h2>
            <button
              onClick={clearSensorLogs}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm"
            >
              Clear Logs
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {sensorLogs.length === 0 && (
              <p className="text-center opacity-60 text-sm">
                No sensor logs available
              </p>
            )}

            {sensorLogs.map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-md text-sm border ${
                  log.status === "FAIL"
                    ? "border-red-400 bg-red-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="font-semibold">
                  {log.event} — {log.status}
                </p>
                <p className="text-xs opacity-70">
                  {log.details}
                </p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BYPASS LOGS (VERTICAL / FULL WIDTH) ───────── */}
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Detection – Bypass / Manual Control
            </h2>
            <button
              onClick={clearBypassLogs}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm"
            >
              Clear Logs
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {bypassLogs.length === 0 && (
              <p className="text-center opacity-60 text-sm">
                No bypass logs available
              </p>
            )}

            {bypassLogs.map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-md text-sm border ${
                  log.status === "FAIL"
                    ? "border-red-400 bg-red-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="font-semibold">
                  {log.source.toUpperCase()} — {log.action} — {log.status}
                </p>
                <p className="text-xs opacity-70">
                  {log.details}
                </p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
