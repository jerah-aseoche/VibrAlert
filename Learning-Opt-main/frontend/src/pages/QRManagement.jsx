import React, { useState, useEffect } from 'react';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { useNavigate } from 'react-router-dom';

export default function QRManagement() {
  const navigate = useNavigate();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const qrConfigs = [
    {
      title: '📱 Public Monitor',
      description: 'Read-only access - No login required',
      url: `${baseUrl}/`,
      role: 'public'
    },
    {
      title: '🔐 Admin Login',
      description: 'Full control access - Requires login credentials',
      url: `${baseUrl}/admin-login`,
      role: 'admin'
    },
    {
      title: '📊 Staff Logs',
      description: 'Read-only logs - Requires staff credentials',
      url: `${baseUrl}/staff-logs`,
      role: 'staff'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0b3c5d] text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">QR Code Management</h1>
          <button
            onClick={() => navigate('/home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-700">
            📌 Print these QR codes and place them near the ESP32 device.
            <br />
            Users can scan to access the monitoring system on their phones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {qrConfigs.map((config, index) => (
            <QRCodeGenerator
              key={index}
              url={config.url}
              title={config.title}
              description={config.description}
            />
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">📋 Installation Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Scan the "Public Monitor" QR code with your phone's camera</li>
            <li>On iPhone: Tap "Share" → "Add to Home Screen"</li>
            <li>On Android: Tap menu (3 dots) → "Install App" or "Add to Home Screen"</li>
            <li>The app will install as a standalone application</li>
            <li>Enable notifications when prompted</li>
          </ol>
        </div>
      </main>
    </div>
  );
}