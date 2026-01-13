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

  const clearSensorLogs = async () => {
    await axios.delete("http://localhost:3000/api/device/sensor-logs");
    fetchLogs();
  };

  const clearBypassLogs = async () => {
    await axios.delete("http://localhost:3000/api/device/bypass-logs");
    fetchLogs();
  };

  return (
    <div className="min-h-screen bg-[#0b3c5d] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate("/home")}>← Home</button>
        <h1 className="text-2xl font-bold">Detection Logs (Live)</h1>
        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
