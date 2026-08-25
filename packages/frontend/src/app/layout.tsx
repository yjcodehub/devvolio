import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import LenisProvider from '@/components/layout/LenisProvider';
import CustomCursor from '@/components/layout/CustomCursor';
import ClientLayout from '@/components/layout/ClientLayout';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import './globals.css';

// Primary Body typography
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Headings typography
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Devvolio | Multi-Tenant Developer Portfolio Platform',
    template: '%s | Devvolio'
  },
  description: 'Devvolio is a high-performance multi-tenant developer portfolio platform enabling developers to showcase their projects, skills, and experience with custom subdomains.',
  metadataBase: new URL('https://devvolio.in'),
  openGraph: {
    title: 'Devvolio | Multi-Tenant Developer Portfolio Platform',
    description: 'Build, manage, and host your developer portfolio with interactive UI widgets, analytics, and custom domain support.',
    url: 'https://devvolio.in',
    type: 'website',
    locale: 'en_US',
    siteName: 'Devvolio Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devvolio | Multi-Tenant Developer Portfolio Platform',
    description: 'Build, manage, and host your developer portfolio with interactive UI widgets, analytics, and custom domain support.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-white`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LenisProvider>
            {/* Custom interactive mouse cursor follower overlay */}
            <CustomCursor />

            <Toaster theme="dark" position="bottom-right" richColors />
            
            <ClientLayout>{children}</ClientLayout>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
