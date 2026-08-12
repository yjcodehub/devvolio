import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const rawHost = request.headers.get('host') || '';

  // Exclude Next.js static, public assets, and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Strip port number if present (e.g., yash.lvh.me:3000 -> yash.lvh.me)
  const hostWithoutPort = rawHost.split(':')[0].toLowerCase();

  // Base platform domains (local development & production & Vercel deployment previews)
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
  const isBaseDomain =
    baseDomains.includes(hostWithoutPort) ||
    hostWithoutPort.endsWith('.vercel.app');

  if (!isBaseDomain) {
    let tenantKey = hostWithoutPort;
    
    if (hostWithoutPort.endsWith('.devvolio.in')) {
      tenantKey = hostWithoutPort.replace('.devvolio.in', '');
    } else if (hostWithoutPort.endsWith('.lvh.me')) {
      tenantKey = hostWithoutPort.replace('.lvh.me', '');
    } else if (hostWithoutPort.endsWith('.localhost')) {
      tenantKey = hostWithoutPort.replace('.localhost', '');
    }

    if (tenantKey === 'www') {
      return NextResponse.next();
    }

    // Dynamic rewrite to portfolio route folder
    return NextResponse.rewrite(new URL(`/${tenantKey}${url.pathname}`, request.url));
  }

  // Redirect admin, superadmin, and onboarding routes on root domain to app.devvolio.in in production
  const isAdminOrAppRoute =
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/onboarding') ||
    url.pathname.startsWith('/superadmin');

  if (
    isAdminOrAppRoute &&
    (hostWithoutPort === 'devvolio.in' || hostWithoutPort === 'www.devvolio.in')
  ) {
    return NextResponse.redirect(`https://app.devvolio.in${url.pathname}${url.search}`);
  }

  // Handle SaaS app subdomain (app.devvolio.in)
  if (hostWithoutPort === 'app.devvolio.in') {
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
