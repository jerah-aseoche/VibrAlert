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

  // Generate placeholder rows
  const rows = Array.from({ length: 20 }, () => "-");

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
          Detection Logs
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
      <div className="flex-1 overflow-auto p-4 mt-2">

        {/* Container for two columns */}
        <div className="grid grid-cols-2 gap-4">

          {/* LEFT COLUMN */}
          <div className="bg-white shadow rounded-lg">
            <div className="bg-gray-600 text-white text-2xl font-semibold py-3 text-center">
              Detection - Sensor
            </div>

            <table className="w-full text-center">
              <tbody>
                {rows.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-200" : "bg-gray-300"}
                  >
                    <td className="py-3">{item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT COLUMN */}
          <div className="bg-white shadow rounded-lg">
            <div className="bg-gray-600 text-white text-2xl font-semibold py-3 text-center">
              Detection - Bypassed
            </div>

            <table className="w-full text-center">
              <tbody>
                {rows.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-200" : "bg-gray-300"}
                  >
                    <td className="py-3">{item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DetectionLogs;
