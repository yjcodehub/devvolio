'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const baseDomains = [
        'devvolio.in',
        'www.devvolio.in',
        'localhost',
        'www.localhost',
        'lvh.me',
        'www.lvh.me',
        '127.0.0.1',
        'app.devvolio.in'
      ];
      const isBase = baseDomains.includes(host) || host.endsWith('.vercel.app');
      setIsSubdomain(!isBase);
    }
  }, []);

  // Exclude global public Header & Footer from admin, superadmin, signup, login, onboarding routes
  const isAppRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/superadmin') ||
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname === '/onboarding';

  // Exclude root landing page ONLY when on base platform domain (devvolio.in)
  const isExcludedRoute = isAppRoute || (pathname === '/' && !isSubdomain);

  if (isExcludedRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Global slide-to-hide header navbar for tenant portfolio pages */}
      <Header />
      
      {/* Main Content Viewport */}
      <main className="relative min-h-screen overflow-x-hidden pt-24 flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>
        {/* Global site footer for tenant portfolio pages */}
        <Footer />
      </main>
    </>
  );
}
