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
      console.log("Token from URL:", token);
      
      if (!token) {
        console.log("❌ No token found in URL");
        setError("No access token found");
        setTimeout(() => navigate("/"), 2000);
        setIsValidating(false);
        return;
      }

      try {
        console.log("Sending validation request to backend...");
        const response = await axios.post('https://vibralert-backend.fly.dev/api/device/validate-admin-token', { token });
        
        console.log("Validation response:", response.data);
        setDebugInfo({ urlToken: token, response: response.data });
        
        if (response.data.valid === true) {
          console.log("✅ Token valid! Redirecting to dashboard...");
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminUsername", "qr_admin");
          localStorage.setItem("adminAccessMethod", "qr");
          navigate("/home", { replace: true });
        } else {
          console.log("❌ Token invalid according to backend");
          setError("Invalid or expired QR code");
          
          // Get the current backend token for debugging
          try {
            const tokenCheck = await axios.get('https://vibralert-backend.fly.dev/api/device/admin-token');
            console.log("Current backend token:", tokenCheck.data.token);
            setDebugInfo(prev => ({ ...prev, backendToken: tokenCheck.data.token, match: token === tokenCheck.data.token }));
          } catch (e) {
            console.log("Could not fetch backend token:", e);
            setDebugInfo(prev => ({ ...prev, backendToken: "Failed to fetch" }));
          }
          
          setTimeout(() => navigate("/admin-login"), 5000);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setError("Failed to validate access");
        setDebugInfo(prev => ({ ...prev, error: error.message }));
        setTimeout(() => navigate("/admin-login"), 5000);
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
              <details className="mt-4 text-left text-xs opacity-70">
                <summary>Debug Info</summary>
                <p className="break-all">URL Token: {debugInfo.urlToken}</p>
                <p className="break-all">Backend Token: {debugInfo.backendToken || "Unknown"}</p>
                <p>Match: {debugInfo.match === true ? "✅ Yes" : "❌ No"}</p>
                {debugInfo.error && <p>Error: {debugInfo.error}</p>}
              </details>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}