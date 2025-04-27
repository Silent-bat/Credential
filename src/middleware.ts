import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import { locales, defaultLocale } from '@/i18n/config';
import { getToken } from 'next-auth/jwt';

// Helper function to get locale from request
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
  
  // Try to match one of our locales
  try {
    return match(languages, locales, defaultLocale);
  } catch (error) {
    return defaultLocale;
  }
}

// Paths that don't need locale handling or auth checks
const publicPaths = [
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/_next',
  '/images',
  '/api',
  '/static'
];

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/admin',
  '/settings',
];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for asset paths and API routes
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if request already has a locale
  const pathnameHasValidLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  
  // Handle root path - redirect to default locale
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url);
  }
  
  // If path doesn't have a valid locale, prefix it with the detected or default locale
  if (!pathnameHasValidLocale) {
    const locale = 'en'; // Always use 'en' to avoid locale detection issues
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }
  
  // At this point, we have a localized URL
  // Check authentication for protected routes
  const token = await getToken({ req: request });
  const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute && !token) {
    const locale = pathname.split('/')[1];
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.search = `callbackUrl=${encodeURIComponent(request.url)}`;
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with excluded paths
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
}; 