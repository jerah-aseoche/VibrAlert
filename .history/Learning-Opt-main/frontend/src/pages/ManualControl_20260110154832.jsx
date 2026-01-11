import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManualControl() {
  const navigate = useNavigate();

  const [alarmStatus, setAlarmStatus] = useState("OFF");
  const [bypassStatus, setBypassStatus] = useState("NOT SUCCESSFUL");

  const goHome = () => navigate("/home");
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const activateAlarm = () => {
    setAlarmStatus("ON");
    setBypassStatus("SUCCESSFUL");
  };

  const deactivateAlarm = () => {
    setAlarmStatus("OFF");
    setBypassStatus("SUCCESSFUL");
  };

  // Color palette
  const colors = {
    primary: "#185886",      // dark blue
    secondary: "#6EB1D6",    // light blue
    panelBg: "rgba(255,255,255,0.1)", // semi-transparent panel
    textPrimary: "#ffffff",
    textSecondary: "#dbeafe" // soft white-blue
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white">

      {/* ─── BLURRED BACKGROUND ───────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* ─── TOP HEADER ──────────────────────────────────── */}
      <header
        className={`relative z-10 w-full h-16 flex items-center justify-between px-6 shadow-md bg-white rounded-md`}
      >
        <button
          onClick={goHome}
          className="text-black font-semibold hover:text-[#dbeafe] transition"
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

      {/* ─── MAIN CONTENT CONTAINER ─────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center">

          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-10">
            Alarm Control
          </h2>

          {/* Status Boxes */}
          <div className="grid grid-cols-2 gap-8 mb-12 w-full">
            {/* Alarm Status */}
            <div className="bg-white/20 hover:bg-white/30 transition px-10 py-6 rounded-2xl shadow-lg text-center">
              <p className="text-xl font-semibold text-[#dbeafe]">Alarm Status:</p>
              <p className="text-3xl font-bold mt-2 text-[#6EB1D6]">{alarmStatus}</p>
            </div>

            {/* Bypass Status */}
            <div className="bg-white/20 hover:bg-white/30 transition px-10 py-6 rounded-2xl shadow-lg text-center">
              <p className="text-xl font-semibold text-[#dbeafe]">Bypass:</p>
              <p className="text-3xl font-bold mt-2 text-[#6EB1D6]">{bypassStatus}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-12 w-full">
            <button
              onClick={activateAlarm}
              className="bg-[#6EB1D6] hover:bg-[#185886] text-white text-2xl font-bold px-12 py-6 rounded-2xl shadow-xl transition"
            >
              ON
            </button>

            <button
              onClick={deactivateAlarm}
              className="bg-[#6EB1D6] hover:bg-[#185886] text-white text-2xl font-bold px-12 py-6 rounded-2xl shadow-xl transition"
            >
              OFF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
