import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

export async function middleware(request: NextRequest) {
  // T143: Generate unique request ID for logging
  const requestId = nanoid();

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = ['/setup', '/interview', '/report'];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to sign-in if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if authenticated user tries to access sign-in
  if (request.nextUrl.pathname.startsWith('/sign-in') && user) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // T141: Add security headers (CSP, HSTS)
  const response = supabaseResponse;
  
  // Add request ID for logging
  response.headers.set('X-Request-ID', requestId);

  // Content Security Policy (CSP)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://api.openai.com https://api.stripe.com`,
    "media-src 'self' blob:",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
