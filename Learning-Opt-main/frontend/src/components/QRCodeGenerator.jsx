import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';

export default function QRCodeGenerator({ url, title, description }) {
  const [showQR, setShowQR] = useState(false);

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
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
      downloadLink.download = `${title.toLowerCase().replace(/\s/g, '-')}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      {!showQR ? (
        <button
          onClick={() => setShowQR(true)}
          className="bg-[#185886] text-white px-4 py-2 rounded-lg hover:bg-[#1f6fa3] transition"
        >
          Show QR Code
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCode
              id="qr-code"
              value={url}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadQR}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
            >
              Download PNG
            </button>
            <button
              onClick={() => setShowQR(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition"
            >
              Hide
            </button>
          </div>
          <p className="text-xs text-gray-500 break-all">{url}</p>
        </div>
      )}
    </div>
  );
}