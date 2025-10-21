import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import PWAProvider from '@/components/PWAProvider'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Add mobile app-like styling
    if (typeof window !== 'undefined') {
      // Prevent pull-to-refresh on mobile
      document.body.style.overscrollBehavior = 'none';
      
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
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <PWAProvider>
        <Navbar />
        <Component {...pageProps} />
      </PWAProvider>
    </>
  )
}
