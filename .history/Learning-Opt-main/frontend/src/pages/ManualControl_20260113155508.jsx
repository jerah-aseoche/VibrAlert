import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ManualControl() {
  const navigate = useNavigate();

  const [alarmStatus, setAlarmStatus] = useState("OFF");
  const [bypassStatus, setBypassStatus] = useState("NOT SUCCESSFUL");

  const goHome = () => navigate("/home");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sendCommand = async (command) => {
    try {
      await axios.post("http://localhost:3000/api/device/bypass-log", {
        source: "web",
        action: "ON",
        status: "SUCCESS",
        details: "Web alarm ON"
      });

      await axios.post("http://localhost:3000/api/device/bypass-log", {
        source: "web",
        action: "OFF",
        status: "SUCCESS",
        details: "Web alarm OFF"
      });

      setAlarmStatus(command);
      setBypassStatus("SUCCESSFUL");
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col text-white">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* Header */}
      <header className="relative z-10 w-full h-16 flex items-center justify-between px-6 bg-white shadow-md">
        <button onClick={goHome} className="text-black font-semibold">
          ← Home
        </button>

        <img src="/banner.png" alt="Banner" className="h-10" />

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md"
        >
          Logout
        </button>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center">

          <h2 className="text-4xl font-bold mb-10">Alarm Control</h2>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-white/20 p-6 rounded-2xl">
              <p className="text-xl">Alarm Status</p>
              <p className="text-3xl font-bold mt-2 text-[#6EB1D6]">
                {alarmStatus}
              </p>
            </div>

            <div className="bg-white/20 p-6 rounded-2xl">
              <p className="text-xl">Bypass</p>
              <p className="text-3xl font-bold mt-2 text-[#6EB1D6]">
                {bypassStatus}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <button
              onClick={() => sendCommand("ON")}
              className="bg-[#6EB1D6] hover:bg-[#185886] text-2xl font-bold py-6 rounded-2xl"
            >
              ON
            </button>

            <button
              onClick={() => sendCommand("OFF")}
              className="bg-[#6EB1D6] hover:bg-[#185886] text-2xl font-bold py-6 rounded-2xl"
            >
              OFF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
