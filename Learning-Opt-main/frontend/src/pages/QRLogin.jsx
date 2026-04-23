import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function QRLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      
      console.log("🔍 QR Login Debug - Token from URL:", token);
      
      if (!token) {
        console.log("⚠️ No token found in URL");
        setError("No access token found");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        // Validate token with backend
        const response = await axios.post('/api/device/validate-admin-token', { token });
        
        console.log("🔍 Validation response:", response.data);
        
        if (response.data.valid) {
          // Valid token - grant admin access
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminUsername", "qr_admin");
          localStorage.setItem("adminAccessMethod", "qr");
          console.log("✅ QR Login successful! Redirecting to dashboard...");
          navigate("/home", { replace: true });
        } else {
          // Invalid token
          console.log("❌ Invalid token detected");
          setError("Invalid or expired QR code");
          setTimeout(() => navigate("/admin-login"), 2000);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setError("Failed to validate access");
        setTimeout(() => navigate("/admin-login"), 2000);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3c5d]">
      <div className="text-white text-center">
        {isValidating ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Validating access...</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <p className="text-lg mb-2">{error}</p>
            <p className="text-sm opacity-70">Redirecting to login page...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}