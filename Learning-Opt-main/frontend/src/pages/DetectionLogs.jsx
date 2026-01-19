import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DetectionLogs() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("sensor");
  const [logs, setLogs] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* ─── FETCH LOGS (TAB-AWARE) ───────────── */
  const fetchLogs = async () => {
    if (!visible) return;

    try {
      let url = "/api/device/sensor-logs";
      if (activeTab === "web") url = "/api/device/web-bypass-logs";
      if (activeTab === "device") url = "/api/device/device-bypass-logs";

      const res = await axios.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  /* ─── POLLING (ONLY ACTIVE TAB) ────────── */
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      if (!mounted) return;
      await fetchLogs();
    };

    poll();

    const interval = setInterval(poll, 3500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeTab, visible]); // include visible

  /* ─── AUTO STOP DETECTION (READ-ONLY) ──── */
  useEffect(() => {
    if (!logs.length) return;

    const lastLog = logs[0];

    const isAutoStop =
      lastLog?.action === "AUTO_STOP" ||
      lastLog?.event === "AUTO_STOP";

    if (isAutoStop) {
      console.log("[UI] AUTO STOP detected:", lastLog);
      console.log("[UI] AUTO STOP detected in logs:", lastLog);
      // Intentionally NOT mutating alarm state here
    }
  }, [logs]);

  /* ─── CLEAR CURRENT TAB ────────────────── */
  const clearCurrent = async () => {
    try {
      let url = "/api/device/sensor-logs";
      if (activeTab === "web") url = "/api/device/web-bypass-logs";
      if (activeTab === "device") url = "/api/device/device-bypass-logs";

      await axios.delete(url);
      setLogs([]);
    } catch (err) {
      console.error("Clear failed", err);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* ─── BACKGROUND ───────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* ─── HEADER ───────────────────────────── */}
      <header className="relative z-10 h-16 flex items-center justify-between px-6 bg-white shadow-md">
        <button
          onClick={() => navigate("/home")}
          className="text-black font-semibold hover:text-[#6EB1D6]"
        >
          ← Home
        </button>

        <img src="/banner.png" alt="Banner" className="h-10" />

        <button
          onClick={() => navigate("/login")}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-white"
        >
          Logout
        </button>
      </header>

      {/* ─── CONTENT ─────────────────────────── */}
      <main className="relative z-10 p-6 max-w-6xl mx-auto">
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6">
          {/* ─── TABS ─────────────────────────── */}
          <div className="flex gap-3 mb-4">
            <Tab
              label="Sensor"
              active={activeTab === "sensor"}
              onClick={() => setActiveTab("sensor")}
            />
            <Tab
              label="Web Control"
              active={activeTab === "web"}
              onClick={() => setActiveTab("web")}
            />
            <Tab
              label="Device Trigger"
              active={activeTab === "device"}
              onClick={() => setActiveTab("device")}
            />

            <div className="flex-1" />

            <button
              onClick={clearCurrent}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm"
            >
              Clear Current
            </button>
          </div>

          {/* ─── LOG LIST ─────────────────────── */}
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            {logs.length === 0 && (
              <p className="text-center opacity-60 text-sm">No logs available</p>
            )}

            {logs.map((log) => {
              const isAutoStop =
                log.action === "AUTO_STOP" ||
                log.event === "AUTO_STOP";

              const hasTelemetry =
                activeTab === "sensor" &&
                (log.event_mean_rms_g != null ||
                  log.event_peak_rms_g != null ||
                  log.threshold_g != null);

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-md text-sm border ${
                    isAutoStop
                      ? "border-yellow-400 bg-yellow-500/10"
                      : log.status === "FAIL"
                      ? "border-red-400 bg-red-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="font-semibold">
                    {(log.source || "SYSTEM").toUpperCase()} —{" "}
                    {log.action || log.event} — {log.status}
                    {activeTab === "sensor" && log.event_peak_rms_g != null && (
                      <span className="opacity-80 font-normal">
                        {" "}
                        (Peak {Number(log.event_peak_rms_g).toFixed(4)} g)
                      </span>
                    )}
                  </p>

                  <p className="text-xs opacity-70">{log.details}</p>

                  {hasTelemetry && (
                    <p className="text-xs opacity-80 mt-1">
                      Pendulum + MPU6050 — Mean{" "}
                      {log.event_mean_rms_g != null
                        ? Number(log.event_mean_rms_g).toFixed(4)
                        : "—"}
                      g, Peak{" "}
                      {log.event_peak_rms_g != null
                        ? Number(log.event_peak_rms_g).toFixed(4)
                        : "—"}
                      g, Thresh{" "}
                      {log.threshold_g != null
                        ? Number(log.threshold_g).toFixed(4)
                        : "—"}
                      g
                    </p>
                  )}

                  <p className="text-xs opacity-50 mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </p>

                  {isAutoStop && (
                    <p className="mt-1 text-xs font-semibold text-yellow-300">
                      ⚠ AUTO STOP ACTIVATED
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─── TAB BUTTON ───────────────────────────── */
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-[#6EB1D6] text-black font-semibold"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}
