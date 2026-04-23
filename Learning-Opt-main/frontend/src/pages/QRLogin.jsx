import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function QRLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const savedToken = localStorage.getItem('adminQRToken');
    
    console.log("QR Login - Token:", token);
    console.log("QR Login - Saved Token:", savedToken);
    
    if (token && token === savedToken) {
      // Valid token - grant admin access
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminUsername", "qr_admin");
      localStorage.setItem("adminAccessMethod", "qr");
      console.log("✅ QR Login successful, redirecting to /home");
      navigate("/home", { replace: true });
    } else if (token) {
      // Invalid token
      console.log("❌ Invalid token");
      alert("Invalid or expired QR code. Please use the admin login page.");
      navigate("/admin-login", { replace: true });
    } else {
      // No token - redirect to public page
      console.log("No token found, redirecting to /");
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