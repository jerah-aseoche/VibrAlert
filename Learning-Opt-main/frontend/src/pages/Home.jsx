import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  
  // Check if accessed via QR
  const isQRAdmin = localStorage.getItem("adminAccessMethod") === "qr";
  const adminName = localStorage.getItem("adminUsername") || "Admin";

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminAccessMethod");
    navigate("/");
  };

  const goToMonitor = () => {
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* Top Bar */}
      <header className="relative z-10 flex justify-between items-center p-4">
        <button
          onClick={goToMonitor}
          className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition"
        >
          ← Monitor View
        </button>
        
        <div className="flex gap-3 items-center">
          {/* QR Admin Badge */}
          {isQRAdmin && (
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs">
              🔐 QR Access
            </span>
          )}
          <span className="text-white/70 text-sm">Welcome, {adminName}</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <section className="w-full max-w-7xl bg-white backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col lg:flex-row gap-12 overflow-hidden">
          {/* Left Side */}
          <div className="flex-1 flex flex-col ml-10 bg-white justify-center min-w-10">
            <img src="/logo.png" alt="VibrAlert" className="w-full max-w-[200px] mb-12" />
            <h1 className="text-3xl sm:text-4xl text-black font-bold mb-8">
              Admin Dashboard
            </h1>
            <p className="text-base sm:text-lg text-black leading-relaxed max-w-md">
              Welcome back, {adminName}!
              <br />
              Monitor vibration detection logs and
              <br />
              access manual alarm controls.
            </p>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex items-center mr-10 justify-center lg:justify-end">
            <div className="flex flex-col gap-6 items-center lg:items-end">
              <button
                onClick={() => navigate("/detect")}
                className="flex items-center justify-center min-w-[400px] md:min-w-[500px] min-h-[100px] md:min-h-[120px] px-6 py-8 bg-[#185886] text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-[#1f6fa3] hover:scale-105 transition"
              >
                📊 Detection Logs
              </button>

              <button
                onClick={() => navigate("/control")}
                className="flex items-center justify-center min-w-[400px] md:min-w-[500px] min-h-[100px] md:min-h-[120px] px-6 py-8 bg-[#185886] text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-[#1f6fa3] hover:scale-105 transition"
              >
                🎮 Manual Control
              </button>
              
              <button
              onClick={() => navigate("/qr")}
              className="flex items-center justify-center min-w-[400px] md:min-w-[500px] min-h-[100px] md:min-h-[120px] px-6 py-8 bg-[#185886] text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-[#1f6fa3] hover:scale-105 transition"
            >
              📱 QR Code Generator
            </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;