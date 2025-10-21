import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/christunifavcion.png" />
        <link rel="apple-touch-icon" href="/christunifavcion.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#254a9a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* App Title */}
        <meta name="apple-mobile-web-app-title" content="CU Gate" />
        <meta name="application-name" content="CU Gate" />
        
        {/* App Capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Description */}
        <meta name="description" content="Christ University Gated Access Management System - Visitor registration and event management" />
        
        {/* Icons for different platforms */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
