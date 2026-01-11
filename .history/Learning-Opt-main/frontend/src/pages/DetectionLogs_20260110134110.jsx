import React from "react";
import { useNavigate } from "react-router-dom";

function DetectionLogs() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goHome = () => {
    navigate("/home");
  };

  // Placeholder rows (each table independent)
  const sensorRows = Array.from({ length: 20 }, () => "-");
  const bypassedRows = Array.from({ length: 20 }, () => "-");

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-white">

      {/* ─── BLURRED BACKGROUND ───────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* ─── TOP BAR ─────────────────────────────────────── */}
      <header className="relative z-10 w-full h-14 flex items-center justify-between px-6 bg-white border-3 border-[#185886] shadow-md">

        <button
          onClick={goHome}
          className="text-black font-semibold hover:text-[#6EB1D6] transition"
        >
          ← Home
        </button>

        {/* Replaced text with banner image */}
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

      {/* ─── MAIN CONTENT ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ─── SENSOR DETECTION TABLE ─────────────────── */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-[#185886] text-white text-xl font-semibold py-3 text-center">
              Detection – Sensor
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-center text-white">
                <tbody>
                  {sensorRows.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white/10" : "bg-white/5"}
                    >
                      <td className="py-3">{item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── BYPASSED DETECTION TABLE ───────────────── */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-[#6EB1D6] text-[#0b3c5d] text-xl font-semibold py-3 text-center">
              Detection – Bypassed
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-center text-white">
                <tbody>
                  {bypassedRows.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white/10" : "bg-white/5"}
                    >
                      <td className="py-3">{item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default DetectionLogs;
