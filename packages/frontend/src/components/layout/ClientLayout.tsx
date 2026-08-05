'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Exclude global public Header & Footer from root landing page, admin, superadmin, signup, login, and onboarding routes
  const isExcludedRoute = 
    pathname === '/' ||
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/superadmin') ||
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname === '/onboarding';

  if (isExcludedRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Global slide-to-hide header navbar */}
      <Header />
      
      {/* Main Content Viewport (top-padded to offset fixed navigation bar) */}
      <main className="relative min-h-screen overflow-x-hidden pt-24 flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>
        {/* Global site footer */}
        <Footer />
      </main>
    </>
  );
}
