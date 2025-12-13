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
    setBypassStatus("NOT SUCCESSFUL");
  };

  return (
    <div className="min-h-screen bg-[#d9d9d9] text-black flex flex-col">

      {/* ─── TOP TASK BAR ─────────────────────────────── */}
      <div className="w-full bg-[#8a8a8a] h-14 flex items-center justify-between px-6 shadow">

        <button
          onClick={goHome}
          className="text-white font-semibold hover:text-gray-300"
        >
          ← Home
        </button>

        <h1 className="text-2xl font-semibold text-white">
          Manual Control
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded text-white font-medium"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 mt-8">

        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-700 mb-10 mt-2">
          Alarm Control
        </h2>

        {/* Status Boxes */}
        <div className="grid grid-cols-2 gap-10 mb-12">

          {/* Alarm Status Box */}
          <div className="bg-[#efefef] px-10 py-6 rounded-lg shadow text-center">
            <p className="text-xl font-semibold">Alarm Status:</p>
            <p className="text-2xl font-bold mt-2">
              {alarmStatus}
            </p>
          </div>

          {/* Bypass Status Box */}
          <div className="bg-[#efefef] px-10 py-6 rounded-lg shadow text-center">
            <p className="text-xl font-semibold">Bypass:</p>
            <p className="text-2xl font-bold mt-2">
              {bypassStatus}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-20">

          <button
            onClick={activateAlarm}
            className="bg-gray-500 hover:bg-gray-600 text-white text-2xl font-bold px-12 py-6 rounded-md shadow"
          >
            ON
          </button>

          <button
            onClick={deactivateAlarm}
            className="bg-gray-500 hover:bg-gray-600 text-white text-2xl font-bold px-12 py-6 rounded-md shadow"
          >
            OFF
          </button>

        </div>
      </div>
    </div>
  );
}
