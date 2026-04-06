import { useState } from "react";
import { togglePasswordVisibility } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import LoadingSpinner from "./LoadingSpinner";

export default function LoginForm({
  isLoading,
  setIsLoading,
  onSignUp,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const navigate = useNavigate();

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

    setTimeout(() => {
      triggerToast("Login successful! (Mock Mode)", "success");
      navigate("/home");
      setIsLoading(false);
    }, 1000);
  };

  const handleTogglePassword = () => {
    togglePasswordVisibility("password");
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 w-10/12 px-6 max-w-4xl">
      <div>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="w-full p-8 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="relative">
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full p-8 pr-20 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
        />

        <button
          type="button"
          onClick={handleTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-blue-300 select-none"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-zinc-300 hover:bg-blue-300 transition p-6 rounded-md text-zinc font-semibold"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      {showToast && <Toast message={toastMessage} type={toastType} />}
    </form>
  );
}