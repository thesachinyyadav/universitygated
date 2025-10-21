import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed/standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('✅ Service Worker registered:', registration.scope);
          },
          (error) => {
            console.error('❌ Service Worker registration failed:', error);
          }
        );
      });
    }

    // Handle PWA install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed the prompt before
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      if (!hasSeenPrompt) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari - show custom prompt
    if (iOS && !standalone) {
      const hasSeenIOSPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      if (!hasSeenIOSPrompt) {
        // Delay a bit so user sees the page first
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 2000);
      }
    }

    // Check if app is installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    });

    // Check notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      // Show notification prompt after 10 seconds if user is logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        setTimeout(() => {
          const hasSeenNotificationPrompt = localStorage.getItem('notification-prompt-dismissed');
          if (!hasSeenNotificationPrompt) {
            setShowNotificationPrompt(true);
          }
        }, 10000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // For iOS, we can't programmatically install, just show instructions
    if (isIOS) {
      // iOS install instructions are shown in the prompt itself
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
      localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      new Notification('Christ University Gate Access', {
        body: 'You will receive notifications for event updates and access alerts.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
      
      // Subscribe to push notifications if service worker is ready
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // You can implement push subscription here with your backend
          console.log('✅ Ready for push notifications');
        } catch (error) {
          console.error('Push notification subscription failed:', error);
        }
      }
    } else {
      console.log('❌ Notification permission denied');
      localStorage.setItem('notification-prompt-dismissed', 'true');
    }
    
    setShowNotificationPrompt(false);
  };

  const handleDismissNotifications = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  return (
    <>
      {children}

      {/* Install App Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-2xl animate-slide-up">
          <div className="max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg p-2">
                <svg className="w-full h-full text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {isIOS ? '📱 Add to Home Screen' : 'Install Gate Access App'}
                </h3>
                {isIOS ? (
                  <>
                    <p className="text-sm text-white/90 mb-2">
                      Tap the <strong>Share button</strong> 
                      <svg className="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      then <strong>"Add to Home Screen"</strong>
                    </p>
                    <div className="flex items-center space-x-2 bg-white/10 rounded p-2 text-xs">
                      <span className="text-2xl">⬆️</span>
                      <span>Look for the share icon at the bottom of Safari</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-white/90 mb-3">
                    Get quick access from your home screen. Works offline!
                  </p>
                )}
                <div className="flex space-x-2 mt-3">
                  {!isIOS && (
                    <button
                      onClick={handleInstallClick}
                      className="flex-1 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all active:scale-95"
                    >
                      Install Now
                    </button>
                  )}
                  <button
                    onClick={handleDismissInstall}
                    className={`${isIOS ? 'flex-1' : ''} px-4 py-2 border border-white/30 rounded-lg text-sm hover:bg-white/10 transition-all`}
                  >
                    {isIOS ? 'Got it!' : 'Later'}
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissInstall}
                className="flex-shrink-0 text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enable Notifications Prompt */}
      {showNotificationPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 shadow-2xl animate-slide-up">
          <div className="max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Enable Notifications</h3>
                <p className="text-sm text-white/90 mb-3">
                  Stay updated with event approvals and visitor access alerts
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEnableNotifications}
                    className="flex-1 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all active:scale-95"
                  >
                    Enable
                  </button>
                  <button
                    onClick={handleDismissNotifications}
                    className="px-4 py-2 border border-white/30 rounded-lg text-sm hover:bg-white/10 transition-all"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissNotifications}
                className="flex-shrink-0 text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
