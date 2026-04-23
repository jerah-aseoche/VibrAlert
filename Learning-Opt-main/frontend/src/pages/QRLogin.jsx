import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function QRLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const savedToken = localStorage.getItem('adminQRToken');
    
    console.log("🔍 QR Login Debug:");
    console.log("  URL Token:", token);
    console.log("  Saved Token:", savedToken);
    console.log("  Match:", token === savedToken);
    
    if (token && savedToken && token === savedToken) {
      // Valid token - grant admin access
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminUsername", "qr_admin");
      localStorage.setItem("adminAccessMethod", "qr");
      console.log("✅ QR Login successful! Redirecting to dashboard...");
      navigate("/home", { replace: true });
    } else if (token) {
      // Invalid token
      console.log("❌ Invalid token detected");
      alert("Invalid or expired QR code. Please generate a new QR code from the admin dashboard.");
      navigate("/admin-login", { replace: true });
    } else {
      // No token - redirect to public page
      console.log("⚠️ No token found in URL");
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3c5d]">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
}