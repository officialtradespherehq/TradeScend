import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
];

// Make sure the root path '/' doesn't match admin paths
const isExactMatch = (path: string, pattern: string): boolean => path === pattern;

// Admin-only paths
const adminPaths = [
  '/admin',
  '/admin/users',
  '/admin/investments',
  '/admin/settings',
  '/admin/dashboard',
];

// Function to check if a path matches any of the patterns
const matchesPath = (path: string, patterns: string[]): boolean => {
  // Special case for root path '/' to prevent it from matching admin paths
  if (path === '/' && patterns.includes('/')) {
    return true;
  }
  
  return patterns.some(pattern => {
    // Exact match for complete paths
    if (pattern === path) return true;
    
    // For admin paths, make sure we're not matching root path
    if (pattern.startsWith('/admin') && path === '/') return false;
    
    // Pattern with wildcard
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return path.startsWith(prefix);
    }
    
    return false;
  });
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug cookie information
  console.log('Current path:', pathname);
  console.log('Session cookie:', request.cookies.get('session')?.value);
  console.log('isAdmin cookie:', request.cookies.get('isAdmin')?.value);
  
  // Allow public paths without authentication
  if (matchesPath(pathname, publicPaths)) {
    console.log('Path matched public paths, allowing access');
    return NextResponse.next();
  }

  // Check for authentication token
  const sessionCookie = request.cookies.get('session');
  
  // If no session, redirect to login
  if (!sessionCookie || !sessionCookie.value) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // For authenticated requests, check user role for admin paths
  if (matchesPath(pathname, adminPaths)) {
    console.log('Path matched admin paths:', pathname);
    console.log('Admin paths:', adminPaths);
    try {
      // Get the isAdmin claim from the cookie or token
      const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
      console.log('Is admin?', isAdmin);
      
      // If not admin, redirect to user dashboard
      if (!isAdmin) {
        console.log('Not admin, redirecting to dashboard');
        const url = new URL('/dashboard', request.url);
        return NextResponse.redirect(url);
      } else {
        console.log('Admin confirmed, allowing access to admin path');
      }
    } catch (error) {
      console.error('Error verifying admin status:', error);
      // If there's an error, redirect to login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith('/admin')) {
    // Catch any other admin routes not explicitly listed
    console.log('Path starts with /admin but not in adminPaths:', pathname);
    try {
      const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
      console.log('Is admin for other admin route?', isAdmin);
      if (!isAdmin) {
        console.log('Not admin, redirecting to dashboard from other admin route');
        const url = new URL('/dashboard', request.url);
        return NextResponse.redirect(url);
      } else {
        console.log('Admin confirmed for other admin route, allowing access');
      }
    } catch (error) {
      console.error('Error in other admin route check:', error);
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  // For user routes, prevent admins from accessing if needed
  // Redirect admin users back to the admin dashboard
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/user')) {
    try {
      const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
      if (isAdmin) {
        const url = new URL('/admin', request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error checking admin status for user routes:', error);
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth routes
     * 2. /_next (Next.js internals)
     * 3. /fonts, /icons, /images (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
