import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DetectionLogs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sensor");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Offline & Notification States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check notification support and permission
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
        
        const VAPID_PUBLIC_KEY = 'BDKDZu9HQ_1uyQ6VxwqekpHudhAef_ZpIXFaZMBxGYsz6vyUXkHwhBZvScxwE6dkWUn29kmHuDi2NigiwSTKeVQ';
        
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
        alert('Notification permission denied. You can enable it in browser settings.');
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  /* ─── FETCH LOGS BASED ON ACTIVE TAB ─── */
  const fetchLogs = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      let url = "";
      switch (activeTab) {
        case "sensor":
          url = "/api/device/sensor-logs";
          break;
        case "web":
          url = "/api/device/web-bypass-logs";
          break;
        case "device":
          url = "/api/device/device-bypass-logs";
          break;
        default:
          return;
      }

      const res = await axios.get(url);
      if (isMountedRef.current) {
        // Ensure logs is always an array
        const logsData = Array.isArray(res.data) ? res.data : [];
        setLogs(logsData);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab} logs:`, err);
      if (isMountedRef.current) {
        setLogs([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [activeTab]);

  /* ─── POLLING WITH CLEANUP ─── */
  useEffect(() => {
    fetchLogs();
    
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchLogs();
    }, 3000);
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchLogs]);

  /* ─── CLEAR CURRENT TAB LOGS ─── */
  const clearCurrentLogs = async () => {
    if (!window.confirm(`Clear all ${activeTab} logs? This action cannot be undone.`)) {
      return;
    }

    try {
      let url = "";
      switch (activeTab) {
        case "sensor":
          url = "/api/device/sensor-logs";
          break;
        case "web":
          url = "/api/device/web-bypass-logs";
          break;
        case "device":
          url = "/api/device/device-bypass-logs";
          break;
        default:
          return;
      }

      await axios.delete(url);
      await fetchLogs();
      
      const successMsg = document.createElement("div");
      successMsg.textContent = "Logs cleared successfully!";
      successMsg.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (err) {
      console.error("Clear failed:", err);
      alert("Failed to clear logs. Please try again.");
    }
  };

  /* ─── REFRESH MANUALLY ─── */
  const refreshLogs = () => {
    fetchLogs();
  };

  /* ─── RENDER LOG ENTRY ─── */
  const renderLogEntry = (log) => {
    const isAutoStop = log.action === "AUTO_STOP" || log.event === "AUTO_STOP";
    const isSensorTrigger = log.event === "TRIGGERED" || log.source === "sensor";
    
    let title = "";
    if (activeTab === "sensor") {
      title = log.event || "SENSOR EVENT";
    } else if (activeTab === "web") {
      title = log.action || "WEB COMMAND";
    } else {
      title = log.action || "DEVICE ACTION";
    }

    return (
      <div
        key={log.id}
        className={`p-3 rounded-md text-sm border ${
          isAutoStop
            ? "border-yellow-400 bg-yellow-500/10"
            : log.status === "FAIL" || log.status === "FAILED"
            ? "border-red-400 bg-red-500/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex justify-between items-start">
          <p className="font-semibold">
            {(log.source || "SYSTEM").toUpperCase()} — {title}
          </p>
          <span className={`text-xs px-2 py-1 rounded ${
            log.status === "SUCCESS" || log.status === "ACTIVE" 
              ? "bg-green-500/20 text-green-300"
              : log.status === "FAIL" || log.status === "FAILED"
              ? "bg-red-500/20 text-red-300"
              : "bg-yellow-500/20 text-yellow-300"
          }`}>
            {log.status || "UNKNOWN"}
          </span>
        </div>

        {log.details && (
          <p className="text-xs opacity-70 mt-1">{log.details}</p>
        )}

        {activeTab === "sensor" && isSensorTrigger && (
          <div className="mt-2 text-xs opacity-80 space-y-1">
            {log.event_mean_rms_g != null && (
              <p>📊 Mean RMS: {Number(log.event_mean_rms_g).toFixed(6)} g</p>
            )}
            {log.event_peak_rms_g != null && (
              <p>📈 Peak RMS: {Number(log.event_peak_rms_g).toFixed(6)} g</p>
            )}
            {log.threshold_g != null && (
              <p>⚡ Threshold: {Number(log.threshold_g).toFixed(6)} g</p>
            )}
            {log.mpu_hits != null && (
              <p>🎯 MPU Hits: {log.mpu_hits}</p>
            )}
            {log.baseline_rms_g != null && (
              <p>📉 Baseline: {Number(log.baseline_rms_g).toFixed(6)} g</p>
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

        {isAutoStop && (
          <p className="mt-1 text-xs font-semibold text-yellow-300">
            ⏱ AUTO STOP ACTIVATED
          </p>
        )}
      </div>
    );
  };

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
        <button
          onClick={() => navigate("/home")}
          className="text-black font-semibold hover:text-[#6EB1D6]"
        >
          ← Dashboard
        </button>

        <img src="/banner.png" alt="Banner" className="h-10" />

        <div className="flex items-center gap-3">
          {pushSupported && !notificationsEnabled && (
            <button
              onClick={enableNotifications}
              className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded-md text-white text-sm transition flex items-center gap-2"
            >
              🔔 Enable Notifications
            </button>
          )}
          {notificationsEnabled && (
            <span className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
              🔔 Notifications On
            </span>
          )}
          
          <button
            onClick={() => {
              localStorage.removeItem("isAdmin");
              localStorage.removeItem("adminUsername");
              navigate("/");
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-white"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 p-6 max-w-6xl mx-auto">
        <section className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6">
          {/* Tabs */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <Tab
              label="📟 Sensor Logs"
              active={activeTab === "sensor"}
              onClick={() => setActiveTab("sensor")}
            />
            <Tab
              label="🌐 Web Control Logs"
              active={activeTab === "web"}
              onClick={() => setActiveTab("web")}
            />
            <Tab
              label="🖲️ Device Logs"
              active={activeTab === "device"}
              onClick={() => setActiveTab("device")}
            />

            <div className="flex-1" />

            <button
              onClick={refreshLogs}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
            >
              🔄 Refresh
            </button>

            <button
              onClick={clearCurrentLogs}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm"
            >
              🗑️ Clear Current
            </button>
          </div>

          {lastRefresh && (
            <div className="text-right text-xs opacity-50 mb-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {!isOnline && <span className="text-yellow-400 ml-2">(Offline Mode)</span>}
            </div>
          )}

          {/* Log List */}
          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {loading && logs.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-2">Loading logs...</p>
              </div>
            )}

            {!loading && logs.length === 0 && (
              <p className="text-center opacity-60 text-sm py-8">
                No logs available for {activeTab} events
              </p>
            )}

            {Array.isArray(logs) && logs.map((log) => renderLogEntry(log))}
          </div>

          {/* Footer info */}
          <div className="mt-4 text-xs opacity-50 text-center">
            <p>Sensor logs show MPU6050 vibration detection events</p>
            <p>Web logs show commands sent from this dashboard</p>
            <p>Device logs show physical button presses on the ESP32</p>
            {!isOnline && (
              <p className="text-yellow-400 mt-2">⚠️ You are offline - some data may be cached</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* Tab Button Component */
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-[#6EB1D6] text-black font-semibold"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}