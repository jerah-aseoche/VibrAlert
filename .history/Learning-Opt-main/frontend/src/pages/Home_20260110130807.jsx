import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white">

      {/* ─── BLURRED BACKGROUND ───────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md scale-105"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-[#0b3c5d]/80" />

      {/* ─── TOP BAR ─────────────────────────────────────── */}
      <div className="relative z-10 w-full h-16 flex items-center justify-end px-6">
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white font-medium transition"
        >
          Logout
        </button>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-10 py-8">
        <div className="w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 flex">

          {/* ─── LEFT SECTION (BANNER) ───────────────────── */}
          <div className="w-1/2 flex flex-col justify-center">
            <img
              src="/banner.png"
              alt="VibrAlert"
              className="max-w-[260px] mb-6"
            />

            <h1 className="text-4xl font-bold mb-4 text-white">
              Welcome to VibrAlert
            </h1>

            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              Monitor vibration detection logs and
              <br />
              access manual alarm controls with ease.
            </p>
          </div>

          {/* ─── RIGHT SECTION (BUTTONS) ─────────────────── */}
          <div className="w-1/2 flex items-center justify-end">
            <div className="flex gap-6">

              {/* Detection Logs */}
              <button
                onClick={() => navigate("/detect")}
                className="
                  w-52 h-36
                  bg-[#6EB1D6]
                  text-[#0b3c5d]
                  font-semibold text-lg
                  rounded-xl
                  shadow-lg
                  hover:bg-white
                  hover:scale-105
                  transition-all
                "
              >
                Detection Logs
              </button>

              {/* Manual Control */}
              <button
                onClick={() => navigate("/control")}
                className="
                  w-52 h-36
                  bg-[#185886]
                  text-white
                  font-semibold text-lg
                  rounded-xl
                  shadow-lg
                  hover:bg-[#1f6fa3]
                  hover:scale-105
                  transition-all
                "
              >
                Manual Control
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
