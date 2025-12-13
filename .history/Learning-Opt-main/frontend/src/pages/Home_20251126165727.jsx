import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex flex-col">

      {/* ─── Top Task Bar ─────────────────────────────────── */}
      <div className="w-full bg-[#3b3b3b] h-16 flex items-center justify-between px-6 shadow-lg">
        <h1 className="text-xl font-semibold tracking-wide">Creotec Dashboard</h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white font-medium"
        >
          Logout
        </button>
      </div>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-10 py-8">
        <div className="bg-[#a0a0a0b7] rounded-xl p-10 shadow-xl text-center flex flex-col items-center w-full max-w-6xl">

          {/* Logo */}
          <img
            src="/CreotecLogo.png"
            alt="Creotec Logo"
            className="w-[350px] h-[120px] object-contain mb-3 mt-2"
          />

          {/* Welcome Text */}
          <p className="text-2xl font-semibold mt-2">
            Welcome to our internal certificate and training records system.
          </p>

          <p className="text-lg text-gray-300 max-w-4xl mt-4">
            This platform allows you to automatically generate certificates for
            OJT and Immersion programs and conveniently create TESDA records by
            uploading an Excel file.
          </p>

          {/* ─── Buttons Section ─────────────────────────── */}
          <div className="mt-10 flex gap-10">

            {/* Detection Logs Button */}
            <button
              onClick={() => navigate("/detectionlogs")}
              className="w-48 h-48 border border-white rounded-lg flex items-center justify-center text-xl hover:bg-white hover:text-black transition-all"
            >
              Detection Logs
            </button>

            {/* Manual Control Button */}
            <button
              onClick={() => navigate("/manualcontrol")}
              className="w-48 h-48 border border-white rounded-lg flex items-center justify-center text-xl hover:bg-white hover:text-black transition-all"
            >
              Manual Control
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
