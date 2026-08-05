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

  // Base platform domains (local development & production)
  const baseDomains = ['devvolio.in', 'localhost', 'lvh.me', '127.0.0.1', 'app.devvolio.in'];
  const isBaseDomain = baseDomains.includes(hostWithoutPort);

  if (!isBaseDomain) {
    let tenantKey = hostWithoutPort;
    
    if (hostWithoutPort.endsWith('.devvolio.in')) {
      tenantKey = hostWithoutPort.replace('.devvolio.in', '');
    } else if (hostWithoutPort.endsWith('.lvh.me')) {
      tenantKey = hostWithoutPort.replace('.lvh.me', '');
    } else if (hostWithoutPort.endsWith('.localhost')) {
      tenantKey = hostWithoutPort.replace('.localhost', '');
    }

    // Dynamic rewrite to portfolio route folder
    return NextResponse.rewrite(new URL(`/${tenantKey}${url.pathname}`, request.url));
  }

  // Rewrite SaaS app subdomain traffic to Dashboard routes
  if (hostWithoutPort === 'app.devvolio.in') {
    return NextResponse.rewrite(new URL(`/dashboard${url.pathname}`, request.url));
  }

  return NextResponse.next();
}
