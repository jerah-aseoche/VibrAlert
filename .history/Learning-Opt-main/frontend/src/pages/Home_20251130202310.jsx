import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#d9d9d9] text-black flex flex-col">

      {/* ─── Top Task Bar ─────────────────────────────────── */}
      <div className="w-full bg-[#8a8a8a] h-14 flex items-center justify-between px-6 shadow">

        {/* Back Home Button */}
        <button
          onClick={goHome}
          className="text-white font-semibold hover:text-gray-300"
        >
          ← Home
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-white">
          Home
        </h1>

        {/* Logout */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded text-white font-medium"
        >
          Logout
        </button>
      </div>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-10 py-8">
        <div className="bg-[#6EB1D6] rounded-xl p-10 shadow-xl text-center flex flex-col items-center w-full max-w-6xl">

          {/* ─── Buttons Section ─────────────────────────── */}
          <div className="mt-10 flex gap-10">

            {/* Detection Logs Button */}
            <button
              onClick={() => navigate("/detect")}
              className="w-48 h-48 border border-white-400 rounded-lg flex items-center justify-center text-xl hover:bg-white hover:text-black transition-all"
            >
              Detection Logs
            </button>

            {/* Manual Control Button */}
            <button
              onClick={() => navigate("/control")}
              className="w-48 h-48 border border-zinc rounded-lg flex items-center justify-center text-xl hover:bg-white hover:text-black transition-all"
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
