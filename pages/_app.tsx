// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
        <Navbar />
        <main className="max-w-7xl mx-auto">
          <Component {...pageProps} isMobile={isMobile} />
        </main>
      </div>
    </SessionProvider>
  )
}
