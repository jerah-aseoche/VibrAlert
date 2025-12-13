import React, { useState, useEffect } from "react";

export default function ManualControl() {
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    // placeholder effect
    setStatus("Ready");
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#7a61df] p-6">
      <div className="w-full max-w-[500px] bg-[#e6e6e6] rounded-xl shadow-xl p-10 text-center">
        <h1 className="text-[#6b6b6b] font-semibold text-3xl mb-4">
          Manual Control
        </h1>

        <p className="text-zinc-700 text-lg">
          This is a placeholder page.
        </p>

        <p className="mt-4 text-sm text-zinc-500">
          Component Status: <strong>{status}</strong>
        </p>
      </div>
    </div>
  );
}
