// src/middleware.ts
// Schützt alle /admin/* Routen außer /admin/login

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nur /admin Routen absichern
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Login-Seite immer erlaubt
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Session-Cookie prüfen (lightweight check – vollständige Validierung in den Route Handlers)
  const sessionToken = request.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
