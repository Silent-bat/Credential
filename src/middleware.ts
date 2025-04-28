import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import { locales, defaultLocale } from '@/i18n/config';
import { getToken } from 'next-auth/jwt';

// Helper function to get locale from request
function getLocale(request: NextRequest): string {
  // First check for locale in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Then check for locale in path
  const pathLocale = request.nextUrl.pathname.split('/')[1];
  if (pathLocale && locales.includes(pathLocale as any)) {
    return pathLocale;
  }

  // Finally, try to match from accept-language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
  
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

// Authentication-related paths that should never be protected
const authPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
  '/auth/verification',
  '/verify'
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
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  
  // If path doesn't have a valid locale, prefix it with the detected locale
  if (!pathnameHasValidLocale) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  
  // At this point, we have a localized URL
  // Check if this is an auth-related path that should never be protected
  const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
  if (authPaths.some(path => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`))) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute && !token) {
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