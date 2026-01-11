import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import CreateAccount from "../components/CreateAccount";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import LoadingSpinner from "../components/LoadingSpinner";
import "../index.css";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordActive, setForgotPasswordActive] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen flex">

      {isLoading && <LoadingSpinner overlay size={50} color="white" />}

      {/* ================= LEFT PANEL ================= */}
      <div
        className="hidden lg:flex min-h-screen w-1/2 relative items-center justify-center"
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#1b2c7a]/80" />

        {/* Left content */}
        <div className="relative z-10 text-white px-16">
          <img
            src="/banner.png"
            alt="SaleSkip Banner"
            className="mb-8 max-w-[280px]"
          />

          <p className="text-lg opacity-90 leading-relaxed max-w-md">
            Welcome to VibrAlert!
            Monitor logs and access alarm manual controls.
          </p>

        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">

          {/* Dynamic title */}
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {forgotPasswordActive
              ? "Reset Password"
              : showSignUp
              ? "Create New Account"
              : "Welcome Back!"}
          </h1>

          {/* FORM SWITCHING */}
          {showSignUp ? (
            <CreateAccount onBackToLogin={() => setShowSignUp(false)} />
          ) : forgotPasswordActive ? (
            <ForgotPasswordForm
              onBackToLogin={() => setForgotPasswordActive(false)}
            />
          ) : (
            <LoginForm
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onForgotPassword={() => setForgotPasswordActive(true)}
              onSignUp={() => setShowSignUp(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
