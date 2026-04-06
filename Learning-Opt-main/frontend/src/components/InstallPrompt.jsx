import React, { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install');
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200">
      <div className="flex items-start gap-3">
        <img src="/icon-72.png" alt="VibrAlert" className="w-12 h-12" />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Install VibrAlert</h3>
          <p className="text-sm text-gray-600">Install as app for faster access and notifications</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-[#185886] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1f6fa3] transition"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstall(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}