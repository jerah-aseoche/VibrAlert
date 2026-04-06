import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // Preset admin credentials
  const ADMIN_CREDENTIALS = {
    username: "vibralert_admin",
    password: "VibrAlert2024!"
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsLoading(true);
      setError("");
      
      // Store admin session
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminUsername", username);
      
      setTimeout(() => {
        navigate("/home");
        setIsLoading(false);
      }, 500);
    } else {
      setError("Invalid credentials. Access denied.");
    }
  };

  const goBackToMonitor = () => {
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* Left Panel */}
      <div className="hidden lg:flex min-h-screen w-2/5 relative items-center justify-center">
        <div className="relative z-10 text-white text-center">
          <img src="/logo.png" alt="VibrAlert" className="mb-8 max-w-[200px] mx-auto" />
          <h2 className="text-2xl font-bold mb-4">Admin Access Only</h2>
          <p className="opacity-80">Enter your credentials to access</p>
          <p className="opacity-80">the admin dashboard and controls.</p>
          <button
            onClick={goBackToMonitor}
            className="mt-8 text-sm opacity-70 hover:opacity-100 underline"
          >
            ← Back to Monitor
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-3/5 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Login</h1>
            <p className="text-white/70 mt-2">Access the control dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full p-4 rounded-lg bg-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#6EB1D6] outline-none"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full p-4 rounded-lg bg-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#6EB1D6] outline-none pr-20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6EB1D6] hover:bg-[#185886] text-white font-semibold py-4 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-white/50 text-sm">
              Demo credentials: vibralert_admin / VibrAlert2024!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}