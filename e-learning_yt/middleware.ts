import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/forgot-password'];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (path.startsWith('/dashboard')) {
    const role = path.split('/')[2]; // Get role from path
    if (role && role !== userRole) {
      // Redirect to appropriate dashboard based on user's role
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
  }

  return NextResponse.next();
}

// Configure paths that should be checked by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 