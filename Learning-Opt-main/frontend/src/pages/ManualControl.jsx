import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ManualControl() {
  const navigate = useNavigate();

  const [alarmStatus, setAlarmStatus] = useState("OFF");
  const [commandStatus, setCommandStatus] = useState("IDLE");
  const [lastCommand, setLastCommand] = useState(null);

  const goHome = () => navigate("/home");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ───────── POLL SYSTEM STATE ───────── */
  useEffect(() => {
    let isMounted = true;

    const pollState = async () => {
      try {
        const res = await axios.get("/api/device/state");
        if (isMounted) {
          setAlarmStatus(res.data.alarm_status || "OFF");
        }
      } catch (err) {
        console.error("❌ STATE POLL FAILED", err);
      }
    };

    pollState();
    const interval = setInterval(pollState, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ─── CLEAR COMMAND STATUS AFTER TIMEOUT ─── */
  useEffect(() => {
    if (commandStatus !== "SENT") return;
    
    const timer = setTimeout(() => {
      setCommandStatus((prev) => (prev === "SENT" ? "IDLE" : prev));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [commandStatus]);

  /* ───────── SEND COMMAND TO ESP32 ───────── */
  const sendCommand = async (cmd) => {
    if (commandStatus === "SENT") {
      console.log("Command already pending");
      return;
    }

    setCommandStatus("SENDING");
    setLastCommand(cmd);

    try {
      // Send command to backend
      const response = await axios.post(`/api/device/command/${cmd.toLowerCase()}`);
      
      if (response.data.ok) {
        setCommandStatus("SENT");
        
        // Optimistically update UI (will be confirmed by poll)
        if (cmd === "ON") setAlarmStatus("ON");
        if (cmd === "OFF") setAlarmStatus("OFF");
        
        // Clear SENT status after 3 seconds
        setTimeout(() => {
          setCommandStatus((prev) => (prev === "SENT" ? "SUCCESS" : prev));
          setTimeout(() => {
            setCommandStatus((prev) => (prev === "SUCCESS" ? "IDLE" : prev));
          }, 2000);
        }, 3000);
      } else {
        setCommandStatus("FAILED");
        setTimeout(() => setCommandStatus("IDLE"), 3000);
      }
    } catch (err) {
      console.error("Command failed:", err);
      setCommandStatus("FAILED");
      setTimeout(() => setCommandStatus("IDLE"), 3000);
    }
  };

  // Get status color and text
  const getStatusStyle = () => {
    switch (commandStatus) {
      case "SENDING":
        return { bg: "bg-yellow-500", text: "SENDING..." };
      case "SENT":
        return { bg: "bg-blue-500", text: "SENT ✓" };
      case "SUCCESS":
        return { bg: "bg-green-500", text: "SUCCESS ✓" };
      case "FAILED":
        return { bg: "bg-red-500", text: "FAILED ✗" };
      default:
        return { bg: "bg-gray-500", text: "IDLE" };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      <header className="relative z-10 w-full h-16 flex items-center justify-between px-6 bg-white shadow-md">
        <button onClick={goHome} className="text-black font-semibold hover:text-[#6EB1D6]">
          ← Home
        </button>

        <img src="/banner.png" alt="Banner" className="h-10" />

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-white"
        >
          Logout
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white/10 rounded-3xl p-10 text-center backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-10">Alarm Control</h2>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-white/20 p-6 rounded-2xl">
              <p className="text-xl">Alarm Status</p>
              <p className={`text-3xl font-bold ${
                alarmStatus === "ON" ? "text-red-400" : "text-green-400"
              }`}>
                {alarmStatus === "ON" ? "🔴 ACTIVE" : "🟢 INACTIVE"}
              </p>
            </div>

            <div className="bg-white/20 p-6 rounded-2xl">
              <p className="text-xl">Command Status</p>
              <p className={`text-3xl font-bold ${statusStyle.bg} bg-opacity-50 px-4 py-2 rounded-lg inline-block`}>
                {statusStyle.text}
              </p>
              {lastCommand && commandStatus !== "IDLE" && (
                <p className="text-sm mt-2 opacity-80">
                  Last: {lastCommand}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <button
              onClick={() => sendCommand("ON")}
              disabled={commandStatus === "SENDING"}
              className={`bg-red-600 hover:bg-red-700 text-2xl font-bold py-6 rounded-2xl transition-all ${
                commandStatus === "SENDING" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              🔴 TURN ON
            </button>

            <button
              onClick={() => sendCommand("OFF")}
              disabled={commandStatus === "SENDING"}
              className={`bg-green-600 hover:bg-green-700 text-2xl font-bold py-6 rounded-2xl transition-all ${
                commandStatus === "SENDING" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              🟢 TURN OFF
            </button>
          </div>

          <div className="mt-8 text-sm opacity-70">
            <p>⚠️ Note: Alarm auto-stops after 10 seconds if triggered by sensor</p>
          </div>
        </div>
      </main>
    </div>
  );
}