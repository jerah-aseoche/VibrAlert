import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function QRManagement() {
  const navigate = useNavigate();
  const [baseUrl, setBaseUrl] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Force sync with backend - called on page load and when tab becomes visible
  const syncWithBackend = useCallback(async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      setLoading(true);
      setError(null);
      
      console.log("🔄 Syncing with backend...");
      
      // ALWAYS fetch the latest token from backend
      const response = await axios.get('/api/device/admin-token');
      
      if (response.data && response.data.token) {
        const backendToken = response.data.token;
        
        // Check if frontend token matches backend
        if (adminToken !== backendToken) {
          console.log(`Token mismatch! Frontend: ${adminToken}, Backend: ${backendToken}`);
          console.log("✅ Syncing to backend token...");
          setAdminToken(backendToken);
          localStorage.setItem('adminQRToken', backendToken);
        } else {
          console.log("✅ Token already in sync:", backendToken);
        }
      } else {
        throw new Error("No token received from backend");
      }
    } catch (error) {
      console.error("Failed to sync with backend:", error);
      setError("Could not sync with server. Please refresh the page.");
      
      // Fallback to localStorage
      const fallbackToken = localStorage.getItem('adminQRToken');
      if (fallbackToken) {
        setAdminToken(fallbackToken);
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [adminToken, isSyncing]);

  // Sync on component mount
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Sync when tab becomes visible (user returns to page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Tab became visible - syncing...");
        syncWithBackend();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncWithBackend]);

  // Sync every 30 seconds to ensure token is always up to date
  useEffect(() => {
    const interval = setInterval(() => {
      syncWithBackend();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  const generateToken = () => {
    return 'qr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
  };

  const regenerateToken = async () => {
    try {
      setLoading(true);
      const newToken = generateToken();
      
      console.log("🔄 Regenerating new token:", newToken);
      
      // Save new token to backend first
      await axios.post('/api/device/admin-token', { token: newToken });
      
      // Update local state
      setAdminToken(newToken);
      localStorage.setItem('adminQRToken', newToken);
      
      console.log("✅ Token regenerated and synced with backend");
      alert('New admin QR code generated! Old QR codes will no longer work.');
    } catch (error) {
      console.error("Failed to regenerate token:", error);
      alert('Failed to generate new QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    await syncWithBackend();
    alert('Token synchronized with server!');
  };

  const qrConfigs = {
    public: {
      title: '👁️ Public Monitor',
      description: 'Read-only access - No login required',
      url: `${baseUrl}/`,
      badge: 'Public Access',
      badgeColor: 'bg-green-100 text-green-800',
      icon: '📱'
    },
    admin: {
      title: '🔐 Admin Dashboard (QR Access)',
      description: 'Full control - QR code bypasses login',
      url: `${baseUrl}/qr-login?token=${adminToken}`,
      badge: 'Admin QR Key',
      badgeColor: 'bg-red-100 text-red-800',
      icon: '👑'
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `vibralert-${activeTab}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const current = qrConfigs[activeTab];

  if (loading && !adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Syncing with server...</p>
        </div>
      </div>
    );
  }

  if (error && !adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={manualSync}
            className="bg-[#185886] text-white px-4 py-2 rounded-lg hover:bg-[#1f6fa3]"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0b3c5d] text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📱 QR Code Generator</h1>
          <button
            onClick={() => navigate('/home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Sync Status Banner */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {isSyncing ? (
              <span className="text-yellow-600">🔄 Syncing with server...</span>
            ) : (
              <span className="text-green-600">✅ Auto-sync enabled</span>
            )}
          </div>
          <button
            onClick={manualSync}
            disabled={isSyncing}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition"
          >
            Manual Sync
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-700 text-sm">
            📌 <strong>Print these QR codes</strong> and place them near the ESP32 device.
            <br />
            The <strong>Admin QR code</strong> grants instant dashboard access without login.
            <br />
            <span className="text-xs">🔄 QR codes automatically sync with server every 30 seconds.</span>
          </p>
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'public' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span>📱</span> Public Monitor
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'admin' 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span>🔐</span> Admin Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${current.badgeColor}`}>
            {current.badge}
          </div>

          <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
          <p className="text-gray-600 mb-6">{current.description}</p>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-gray-100">
              <QRCode
                id="qr-code"
                value={current.url}
                size={250}
                level="H"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500 break-all font-mono">{current.url}</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={downloadQR}
              className="bg-[#185886] text-white px-6 py-2 rounded-lg hover:bg-[#1f6fa3] transition flex items-center gap-2"
            >
              📥 Download QR Code
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              🖨️ Print
            </button>
          </div>

          {activeTab === 'admin' && (
            <div className="mt-6 pt-4 border-t">
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Current Admin Token:</p>
                <p className="text-xs font-mono text-green-700 break-all">{adminToken}</p>
                <p className="text-xs text-green-600 mt-1">✓ Synchronized with server</p>
              </div>
              
              <button
                onClick={regenerateToken}
                disabled={loading || isSyncing}
                className="text-red-600 text-sm hover:text-red-800 underline disabled:opacity-50"
              >
                🔄 Regenerate QR Code (Old QR will stop working)
              </button>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Only regenerate if the QR code has been compromised
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📱</span>
              <h3 className="font-bold text-green-800">Public Access</h3>
            </div>
            <p className="text-green-700 text-sm mb-3">
              Scan this QR code to view real-time detection logs. 
              <strong> No login required.</strong>
            </p>
            <div className="bg-green-100 rounded p-2 text-xs text-green-800">
              ✅ Read-only access to sensor logs
              <br />✅ View current alarm status
              <br />✅ Auto-refreshes every 5 seconds
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔐</span>
              <h3 className="font-bold text-red-800">Admin QR Access</h3>
            </div>
            <p className="text-red-700 text-sm mb-3">
              Scan this QR code to instantly access the admin dashboard.
              <strong> No login required via QR!</strong>
            </p>
            <div className="bg-red-100 rounded p-2 text-xs text-red-800">
              ✅ Full control over alarm system
              <br />✅ Automatic login via QR
              <br />✅ Manual ON/OFF controls
              <br />✅ Access to all logs
            </div>
            <div className="mt-3 bg-yellow-100 rounded p-2 text-xs text-yellow-800">
              🔒 <strong>Security Note:</strong> Typing the URL directly will require login.
              Only QR code grants instant access.
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📋</span> How to Install on Phone
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">📱 Android</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Scan QR code with camera</li>
                <li>Tap the menu (3 dots) → "Install App"</li>
                <li>Tap "Install" on the popup</li>
                <li>App appears on home screen</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">🍎 iPhone</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Scan QR code with camera</li>
                <li>Tap "Open" in the notification</li>
                <li>Tap Share button → "Add to Home Screen"</li>
                <li>Tap "Add" in the top-right</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}