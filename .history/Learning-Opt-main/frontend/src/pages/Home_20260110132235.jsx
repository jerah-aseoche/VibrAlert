import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-white">

      {/* ─── BLURRED BACKGROUND (ZOOM SAFE) ───────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* ─── TOP BAR ─────────────────────────────────────── */}
      <header className="relative z-10 flex justify-end p-4">
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </header>

      {/* ─── MAIN CONTENT ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <section
          className="
            w-full max-w-7xl
            bg-white/10 backdrop-blur-xl
            rounded-2xl shadow-2xl
            p-8 sm:p-12
            flex flex-col lg:flex-row
            gap-12
            overflow-hidden
          "
        >

          {/* ─── LEFT (BANNER / TEXT) ───────────────────── */}
          <div className="flex-1 flex flex-col justify-center min-w-10">
            <img
              src="/banner.png"
              alt="VibrAlert"
              className="w-full max-w-[300px] mb-20"
            />

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Welcome to the home page.
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-md">
              Monitor vibration detection logs and
              <br />
              access manual alarm controls with ease.
            </p>
          </div>

          {/* ─── RIGHT (BUTTONS) ────────────────────────── */}
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            <div className="flex flex-wrap gap-6 justify-center lg:justify-end">

              {/* Detection Logs */}
              <button
                onClick={() => navigate("/detect")}
                className="
                  flex items-center justify-center
                  min-w-[200px] min-h-[120px]
                  px-6 py-8
                  bg-[#6EB1D6]
                  text-[#0b3c5d]
                  font-semibold text-lg
                  rounded-xl
                  shadow-lg
                  hover:bg-white
                  hover:scale-105
                  transition
                "
              >
                Detection Logs
              </button>

              {/* Manual Control */}
              <button
                onClick={() => navigate("/control")}
                className="
                  flex items-center justify-center
                  min-w-[200px] min-h-[120px]
                  px-6 py-8
                  bg-[#185886]
                  text-white
                  font-semibold text-lg
                  rounded-xl
                  shadow-lg
                  hover:bg-[#1f6fa3]
                  hover:scale-105
                  transition
                "
              >
                Manual Control
              </button>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
