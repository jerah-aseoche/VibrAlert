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

          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Hello<br />SaleSkip! 👋
          </h1>

          <p className="text-lg opacity-90 leading-relaxed max-w-md">
            Skip repetitive and manual sales-marketing tasks.
            Get highly productive through automation and save tons of time!
          </p>

          <p className="mt-16 text-sm opacity-70">
            © 2022 SaleSkip. All rights reserved.
          </p>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">

          {/* Brand name */}
          <h2 className="text-xl font-semibold mb-10 text-gray-800">
            SaleSkip
          </h2>

          {/* Dynamic title */}
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {forgotPasswordActive
              ? "Reset Password"
              : showSignUp
              ? "Create New Account"
              : "Welcome Back!"}
          </h1>

          {/* Subtitle */}
          {!forgotPasswordActive && !showSignUp && (
            <p className="text-gray-500 mb-8">
              Don’t have an account?{" "}
              <span
                onClick={() => setShowSignUp(true)}
                className="text-blue-600 cursor-pointer underline"
              >
                Create a new account now
              </span>
              , it’s FREE!
            </p>
          )}

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
