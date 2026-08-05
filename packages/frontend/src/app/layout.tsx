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
  title: 'Yashkumar Jais | Senior Frontend Engineer Portfolio',
  description: 'Explore the professional portfolio and experience timeline of Yashkumar Jais, a Frontend Developer specializing in React, Next.js, and Angular.',
  metadataBase: new URL('https://yashjais.com'),
  openGraph: {
    title: 'Yashkumar Jais | Senior Frontend Engineer',
    description: 'Portfolio showcasing 6+ years of engineering interactive digital products.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Yashkumar Jais Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yashkumar Jais | Senior Frontend Engineer',
    description: 'Portfolio showcasing 6+ years of engineering interactive digital products.',
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
