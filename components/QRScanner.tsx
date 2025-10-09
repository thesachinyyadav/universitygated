import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';

interface QRScannerProps {
  onScan: (visitorId: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [manualId, setManualId] = useState('');
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [scannerActive, setScannerActive] = useState(false);

  const requestCameraPermission = async () => {
    try {
      // Check if running on HTTPS or localhost
      const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
      if (!isSecureContext) {
        alert('⚠️ Camera requires HTTPS! Please use the deployed Vercel URL or localhost.');
        setCameraPermission('denied');
        return;
      }

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('❌ Camera API not available in this browser. Please use Chrome, Firefox, or Safari.');
        setCameraPermission('denied');
        return;
      }

      console.log('🎥 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      
      console.log('✅ Camera access granted!');
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      initializeScanner();
    } catch (error: any) {
      console.error('❌ Camera error:', error);
      setCameraPermission('denied');
      
      let errorMessage = '';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = '🚫 Camera access denied!\n\nPlease click the camera icon in your browser address bar and allow camera access.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = '📷 No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = '⚠️ Camera is being used by another application.\n\nPlease close other apps using the camera and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '⚙️ Camera constraints not supported. Trying again...';
        // Retry without constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setCameraPermission('granted');
          initializeScanner();
          return;
        } catch (retryError) {
          errorMessage = '❌ Camera initialization failed.';
        }
      } else if (error.name === 'SecurityError') {
        errorMessage = '🔒 Security error: Camera requires HTTPS!\n\nPlease deploy to Vercel or use localhost.';
      } else {
        errorMessage = `❌ Camera error: ${error.message || 'Unknown error'}\n\nPlease check browser settings.`;
      }
      
      alert(errorMessage);
    }
  };

  const initializeScanner = () => {
    if (scannerInitialized) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Extract visitor ID from URL or use raw text
        const match = decodedText.match(/id=([a-f0-9-]+)/i);
        const visitorId = match ? match[1] : decodedText;
        onScan(visitorId);
        scanner.clear();
        setScannerActive(false);
        setScannerInitialized(false);
      },
      (error) => {
        // Ignore scanning errors - they're thrown constantly during scanning
      }
    );

    setScannerInitialized(true);
    setScannerActive(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      onScan(manualId.trim());
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Camera Scanner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center space-x-3 mb-4">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Scan QR Code
          </h3>
        </div>

        {!scannerActive && cameraPermission === 'prompt' && (
          <div className="text-center py-8">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="text-gray-600 mb-6 px-4">
              Camera access is required to scan visitor QR codes
            </p>
            <button
              onClick={requestCameraPermission}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span className="text-lg">Enable Camera</span>
            </button>
          </div>
        )}

        {cameraPermission === 'denied' && (
          <div className="text-center py-8 bg-red-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 font-medium mb-2">Camera Access Denied</p>
            <p className="text-sm text-gray-600 px-4">
              Please enable camera permissions in your browser settings to scan QR codes.
            </p>
          </div>
        )}

        {scannerActive && (
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
        )}
      </motion.div>

      {/* Manual Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center space-x-3 mb-4">
          <svg className="w-6 h-6 text-tertiary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
            Manual Entry
          </h3>
        </div>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="label">Enter Visitor ID</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Paste or type visitor ID"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-tertiary-600 hover:bg-tertiary-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Verify Access</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
