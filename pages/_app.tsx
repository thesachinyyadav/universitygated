import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import PWAProvider from '@/components/PWAProvider'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Add mobile app-like styling
    if (typeof window !== 'undefined') {
      // Prevent pull-to-refresh on mobile
      document.body.style.overscrollBehavior = 'none';
      
      // Add safe area insets for notched devices
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
      
      // Add iOS standalone mode detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      
      if (isStandalone) {
        document.body.classList.add('standalone-mode');
      }
    }
  }, []);

  return (
    <PWAProvider>
      <Component {...pageProps} />
    </PWAProvider>
  )
}
