import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PublicLogs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [alarmStatus, setAlarmStatus] = useState("OFF");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Offline & Notification States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false); // ✅ Fixed: removed "controller"

  // ✅ CHECK FOR ADMIN TOKEN FIRST - Redirect to Dashboard
  useEffect(() => {
    const adminToken = searchParams.get('admin_token');
    const savedToken = localStorage.getItem('adminQRToken');
    
    if (adminToken && adminToken === savedToken) {
      // Valid admin token found - auto-login and redirect to dashboard
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminUsername", "qr_admin");
      localStorage.setItem("adminAccessMethod", "qr");
      
      // Redirect to dashboard (remove token from URL)
      navigate("/home", { replace: true });
      return;
    }
    
    // If token is invalid but present, redirect to admin login
    if (adminToken && adminToken !== savedToken) {
      alert("Invalid or expired QR code. Please use the admin login page.");
      navigate("/admin-login", { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  // Check notification support
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    
    if (supported) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Online/Offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Convert VAPID public key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Enable push notifications
  const enableNotifications = async () => {
    if (!pushSupported) {
      alert('Push notifications are not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID Public Key - replace with your actual key
        const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE';
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        const response = await axios.post('/api/device/subscribe-push', { subscription });
        
        if (response.data.ok) {
          setNotificationsEnabled(true);
          alert('🔔 Notifications enabled! You will receive alerts when the alarm triggers.');
        }
      } else {
        alert('Notification permission denied.');
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      alert('Failed to enable notifications.');
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get("/api/device/state");
      setAlarmStatus(res.data.alarm_status || "OFF");
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/device/sensor-logs");
      setLogs(res.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getAlarmDisplay = () => {
    if (alarmStatus === "ON") {
      return { text: "ACTIVE", color: "text-red-400", bg: "bg-red-500/20", icon: "🔴" };
    }
    return { text: "INACTIVE", color: "text-green-400", bg: "bg-green-500/20", icon: "🟢" };
  };

  const alarmDisplay = getAlarmDisplay();

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          📡 Offline Mode - Showing cached data
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 h-16 flex items-center justify-between px-6 bg-white shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="VibrAlert" className="h-8" />
          <span className="text-black font-semibold">VibrAlert Monitor</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          {pushSupported && !notificationsEnabled && (
            <button
              onClick={enableNotifications}
              className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded-md text-white text-sm transition flex items-center gap-2"
            >
              🔔 Enable Notifications
            </button>
          )}
          {notificationsEnabled && (
            <span className="bg-green-500/20 text-green-400 px-3 py-2 rounded-md text-sm flex items-center gap-2">
              🔔 Notifications On
            </span>
          )}
          
          {/* Admin Login Button */}
          <button
            onClick={() => navigate("/admin-login")}
            className="bg-[#185886] hover:bg-[#1f6fa3] px-4 py-2 rounded-md text-white transition flex items-center gap-2"
          >
            🔐 Admin Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Status Banner */}
        <div className="mb-6 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Real-Time Monitoring</h1>
              <p className="text-sm opacity-70 mt-1">
                Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Loading...'}
              </p>
              {!isOnline && (
                <p className="text-xs text-yellow-400 mt-1">
                  ⚠️ You are offline - showing cached data
                </p>
              )}
            </div>
            
            <div className={`${alarmDisplay.bg} px-6 py-3 rounded-lg text-center`}>
              <div className="text-3xl mb-1">{alarmDisplay.icon}</div>
              <div className={`text-xl font-bold ${alarmDisplay.color}`}>
                Alarm {alarmDisplay.text}
              </div>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📋 Recent Detection Events</h2>
            <div className="text-xs opacity-50">
              Auto-refreshes every 5 seconds
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {loading && logs.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-2">Loading logs...</p>
              </div>
            )}

            {!loading && logs.length === 0 && (
              <div className="text-center py-8 opacity-60">
                <p>No detection events recorded yet</p>
                <p className="text-sm mt-2">Trigger the sensor to see logs here</p>
              </div>
            )}

            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <p className="font-semibold">
                      {log.event || "DETECTION EVENT"}
                    </p>
                    {log.details && (
                      <p className="text-xs opacity-70 mt-1">{log.details}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    log.status === "ACTIVE" 
                      ? "bg-red-500/20 text-red-300"
                      : "bg-green-500/20 text-green-300"
                  }`}>
                    {log.status || "UNKNOWN"}
                  </span>
                </div>

                {log.event_peak_rms_g != null && (
                  <div className="mt-2 text-xs opacity-80">
                    <span className="inline-block mr-3">
                      📊 Peak: {Number(log.event_peak_rms_g).toFixed(6)} g
                    </span>
                    {log.threshold_g != null && (
                      <span>⚡ Threshold: {Number(log.threshold_g).toFixed(6)} g</span>
                    )}
                  </div>
                )}

                {log.occurred_offline === 1 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    📡 Occurred while device was offline
                  </p>
                )}

                <p className="text-xs opacity-50 mt-2">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs opacity-50 text-center border-t border-white/10 pt-4">
            <p>🔍 This is a read-only monitoring page - No controls available</p>
            <p>📱 Scan QR code for quick access | 🔐 Admin login for full control</p>
          </div>
        </section>
      </main>
    </div>
  );
}