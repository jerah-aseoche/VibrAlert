import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import CreateAccount from '../components/CreateAccount';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import LoadingSpinner from '../components/LoadingSpinner';
import '../index.css';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordActive, setForgotPasswordActive] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#6EB1D6] p-6">
      {isLoading && <LoadingSpinner overlay size={50} color="white" />}

      {/* Center Container */}
      <div className="w-full max-w-[500px] bg-[#185886] rounded-xl shadow-xl p-10 flex flex-col items-center text-center">

        {/* Title */}
        <h1 className="text-[#6b6b6b] font-semibold text-3xl mb-7">
          {forgotPasswordActive
            ? "Reset Password"
            : showSignUp
            ? "Create New Account"
            : "Admin Login"}
        </h1>

        {/* FORM SWITCHING */}
        {showSignUp ? (
          <CreateAccount onBackToLogin={() => setShowSignUp(false)} />
        ) : forgotPasswordActive ? (
          <ForgotPasswordForm onBackToLogin={() => setForgotPasswordActive(false)} />
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
  );
}
