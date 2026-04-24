import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function QRLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      
      console.log("========== QR LOGIN DEBUG ==========");
      console.log("1. Token from URL:", token);
      console.log("2. Token length:", token?.length);
      console.log("3. Full URL:", window.location.href);
      
      setDebugInfo({ urlToken: token, fullUrl: window.location.href });
      
      if (!token) {
        console.log("❌ No token found in URL");
        setError("No access token found");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        console.log("4. Sending validation request to backend...");
        const response = await axios.post('/api/device/validate-admin-token', { token });
        
        console.log("5. Backend response:", response.data);
        setDebugInfo(prev => ({ ...prev, response: response.data }));
        
        if (response.data.valid) {
          console.log("✅ Token valid! Redirecting to dashboard...");
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminUsername", "qr_admin");
          localStorage.setItem("adminAccessMethod", "qr");
          navigate("/home", { replace: true });
        } else {
          console.log("❌ Token invalid according to backend");
          setError("Invalid or expired QR code");
          
          // Additional debug: try to get the stored token from backend
          try {
            const tokenResponse = await axios.get('/api/device/admin-token');
            console.log("6. Stored backend token:", tokenResponse.data);
            setDebugInfo(prev => ({ ...prev, storedToken: tokenResponse.data.token }));
          } catch (e) {
            console.log("6. Failed to get stored token:", e);
          }
          
          setTimeout(() => navigate("/admin-login"), 3000);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setError("Failed to validate access");
        setTimeout(() => navigate("/admin-login"), 3000);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3c5d]">
      <div className="text-white text-center max-w-md p-6">
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
            {debugInfo.urlToken && (
              <details className="mt-4 text-left text-xs opacity-50">
                <summary>Debug Info</summary>
                <p>URL Token: {debugInfo.urlToken?.substring(0, 20)}...</p>
                <p>Stored Token: {debugInfo.storedToken?.substring(0, 20)}...</p>
                <p>Full URL: {debugInfo.fullUrl}</p>
              </details>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}