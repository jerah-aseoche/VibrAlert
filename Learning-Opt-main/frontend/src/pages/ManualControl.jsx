import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ManualControl() {
  const navigate = useNavigate();

  const [alarmStatus, setAlarmStatus] = useState("OFF");
  const [commandStatus, setCommandStatus] = useState("IDLE");
  const [lastCommand, setLastCommand] = useState(null);
  
  // Offline & Notification States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  const goHome = () => navigate("/home");

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    navigate("/");
  };

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
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID Public Key (replace with your actual key from backend)
        const VAPID_PUBLIC_KEY = 'BDKDZu9HQ_1uyQ6VxwqekpHudhAef_ZpIXFaZMBxGYsz6vyUXkHwhBZvScxwE6dkWUn29kmHuDi2NigiwSTKeVQ';
        
        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Send subscription to backend
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

  /* ───────── POLL SYSTEM STATE ───────── */
  useEffect(() => {
    let isMounted = true;

    const pollState = async () => {
      try {
        const res = await axios.get("/api/device/state");
        if (isMounted) {
          setAlarmStatus(res.data.alarm_status || "OFF");
        }
      } catch (err) {
        console.error("❌ STATE POLL FAILED", err);
      }
    };

    pollState();
    const interval = setInterval(pollState, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ─── CLEAR COMMAND STATUS AFTER TIMEOUT ─── */
  useEffect(() => {
    if (commandStatus !== "SENT") return;
    
    const timer = setTimeout(() => {
      setCommandStatus((prev) => (prev === "SENT" ? "IDLE" : prev));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [commandStatus]);

  /* ───────── SEND COMMAND TO ESP32 ───────── */
  const sendCommand = async (cmd) => {
    if (commandStatus === "SENT") {
      console.log("Command already pending");
      return;
    }

    setCommandStatus("SENDING");
    setLastCommand(cmd);

    try {
      // Send command to backend
      const response = await axios.post(`/api/device/command/${cmd.toLowerCase()}`);
      
      if (response.data.ok) {
        setCommandStatus("SENT");
        
        // Optimistically update UI (will be confirmed by poll)
        if (cmd === "ON") setAlarmStatus("ON");
        if (cmd === "OFF") setAlarmStatus("OFF");
        
        // Clear SENT status after 3 seconds
        setTimeout(() => {
          setCommandStatus((prev) => (prev === "SENT" ? "SUCCESS" : prev));
          setTimeout(() => {
            setCommandStatus((prev) => (prev === "SUCCESS" ? "IDLE" : prev));
          }, 2000);
        }, 3000);
      } else {
        setCommandStatus("FAILED");
        setTimeout(() => setCommandStatus("IDLE"), 3000);
      }
    } catch (err) {
      console.error("Command failed:", err);
      setCommandStatus("FAILED");
      setTimeout(() => setCommandStatus("IDLE"), 3000);
    }
  };

  // Get status color and text
  const getStatusStyle = () => {
    switch (commandStatus) {
      case "SENDING":
        return { bg: "bg-yellow-500", text: "SENDING..." };
      case "SENT":
        return { bg: "bg-blue-500", text: "SENT ✓" };
      case "SUCCESS":
        return { bg: "bg-green-500", text: "SUCCESS ✓" };
      case "FAILED":
        return { bg: "bg-red-500", text: "FAILED ✗" };
      default:
        return { bg: "bg-gray-500", text: "IDLE" };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-[#0b3c5d]/70" />

      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          📡 Offline Mode - Some features may be limited
        </div>
      )}

      <header className="relative z-10 w-full h-16 flex items-center justify-between px-6 bg-white shadow-md">
        <button onClick={goHome} className="text-black font-semibold hover:text-[#6EB1D6]">
          ← Dashboard
        </button>

        <img src="/banner.png" alt="Banner" className="h-10" />

        <div className="flex items-center gap-3">
          {/* Notification Button */}
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
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white/10 rounded-3xl p-10 text-center backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-10">Alarm Control</h2>

          {/* Offline Warning inside main content */}
          {!isOnline && (
            <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
              ⚠️ You are offline. Commands will be queued and sent when connection is restored.
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-white/20 p-6 rounded-2xl">
              <p className="text-xl">Alarm Status</p>
              <p className={`text-3xl font-bold ${
                alarmStatus === "ON" ? "text-red-400" : "text-green-400"
              }`}>
                {alarmStatus === "ON" ? "🔴 ACTIVE" : "🟢 INACTIVE"}
              </p>
            </div>

            <div className="bg-white/20 p-6 rounded-2xl">
              <p className="text-xl">Command Status</p>
              <p className={`text-3xl font-bold ${statusStyle.bg} bg-opacity-50 px-4 py-2 rounded-lg inline-block`}>
                {statusStyle.text}
              </p>
              {lastCommand && commandStatus !== "IDLE" && (
                <p className="text-sm mt-2 opacity-80">
                  Last: {lastCommand}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <button
              onClick={() => sendCommand("ON")}
              disabled={commandStatus === "SENDING"}
              className={`bg-red-600 hover:bg-red-700 text-2xl font-bold py-6 rounded-2xl transition-all ${
                commandStatus === "SENDING" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              🔴 TURN ON
            </button>

            <button
              onClick={() => sendCommand("OFF")}
              disabled={commandStatus === "SENDING"}
              className={`bg-green-600 hover:bg-green-700 text-2xl font-bold py-6 rounded-2xl transition-all ${
                commandStatus === "SENDING" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              🟢 TURN OFF
            </button>
          </div>

          <div className="mt-8 text-sm opacity-70">
            <p>⚠️ Note: Alarm auto-stops after 10 seconds if triggered by sensor</p>
            {!isOnline && (
              <p className="mt-2 text-yellow-400">📡 Commands will be sent when you're back online</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}