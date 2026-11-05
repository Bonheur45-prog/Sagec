import { NextResponse, type NextRequest } from 'next/server';

// Admin guard, without the database (middleware must stay fast): sends visitors WITHOUT a session
// cookie away from /admin pages. It cannot check whether the cookie is valid, so every admin page
// and server action also calls requireUser().
//
// SAGEC is English only: there are no language prefixes to handle here.

const SESSION_COOKIE = 'sagec_admin_session'; // keep in sync with src/lib/auth/session.ts

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login' || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  // Admin pages only. /admin/api/* route handlers check the session themselves (authenticateApi).
  matcher: ['/admin', '/admin/((?!api/).*)'],
};
