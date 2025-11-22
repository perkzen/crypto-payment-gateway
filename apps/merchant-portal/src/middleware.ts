import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session cookie using better-auth helper
  // NOTE: This only checks for cookie existence, not validation
  // Session validation should be done in protected pages/routes
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  // If trying to access dashboard without auth, redirect to sign-in
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If authenticated and on sign-in page, redirect to dashboard
  // if (pathname === '/sign-in' && isAuthenticated) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
