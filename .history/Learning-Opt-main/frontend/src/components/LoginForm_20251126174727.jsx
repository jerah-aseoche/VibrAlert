import { useState } from "react";
import { togglePasswordVisibility } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import Toast from "./Toast";
import LoadingSpinner from "./LoadingSpinner";

export default function LoginForm({
  isLoading,
  setIsLoading,
  onForgotPassword,
  onSignUp,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const navigate = useNavigate();
  const { login } = useAuth(); // ⬅️ NEW: real authentication

  const triggerToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      triggerToast("Please fill in both fields.", "error");
      return;
    }

    setIsLoading(true);

    // 🔥 REAL LOGIN — Calls AuthContext.login()
    const result = await login(username, password);

    setIsLoading(false);

    if (!result.success) {
      triggerToast(result.message || "Login failed", "error");
      return;
    }

    // SUCCESS
    triggerToast("Login successful!", "success");

    setTimeout(() => {
      navigate("/home"); // redirect to home
    }, 600);
  };

  const handleTogglePassword = () => {
    togglePasswordVisibility("password");
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 w-full max-w-md">

      {/* Username */}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
        className="w-full p-4 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
      />

      {/* Password */}
      <div className="relative">
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 pr-20 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
        />

        <button
          type="button"
          onClick={handleTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-300 hover:text-violet-400 select-none"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Forgot / Create Account */}
      <div className="flex justify-between text-sm">
        <a
          href="#"
          className="text-violet-400 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            onForgotPassword?.();
          }}
        >
          Forgot Password?
        </a>

        <a
          href="#"
          className="text-violet-400 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            onSignUp?.();
          }}
        >
          Create Account
        </a>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-violet-600 hover:bg-violet-700 transition p-4 rounded-md text-white font-semibold"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      {isLoading && <LoadingSpinner overlay size={50} color="white" />}

      {showToast && <Toast message={toastMessage} type={toastType} />}
    </form>
  );
}
