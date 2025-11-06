import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { isMobileUserAgent } from './lib/userAgent';

export async function middleware(request: NextRequest) {
  try {
    // T143: Generate unique request ID for logging
    const requestId = nanoid();

    // T153: Redirect mobile users to mobile landing page
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = isMobileUserAgent(userAgent);
    const { pathname } = request.nextUrl;

    let supabaseResponse = NextResponse.next({
      request,
    });

    // Check if required env vars are available (support both formats)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Middleware] Missing Supabase environment variables');
      // Allow request to proceed without auth check
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
    });

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // T200: Premium user detection and redirect
    // If user visits root (/ or /mobile), check if they're premium and redirect to /dashboard
    if (user && (pathname === '/' || pathname === '/mobile')) {
      try {
        // Check for super admin first (always gets premium access)
        const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '')
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0);
        
        const isSuperAdmin = SUPER_ADMIN_EMAILS.length > 0 && 
          user.email && 
          SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        if (isSuperAdmin) {
          // Super admin - always redirect to dashboard
          const dashboardUrl = new URL('/dashboard', request.url);
          if (isMobile) {
            dashboardUrl.searchParams.set('view', 'mobile');
          }
          return NextResponse.redirect(dashboardUrl);
        }
        
        // Check for regular premium entitlements
        const { data: entitlements } = await supabase
          .from('entitlements')
          .select('tier, expires_at, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Check if user has active entitlement that hasn't expired
        const isPremium = entitlements && entitlements.length > 0 && (
          entitlements[0].expires_at === null || 
          new Date(entitlements[0].expires_at) > new Date()
        );
        
        if (isPremium) {
          // Premium user - redirect to dashboard (preserves mobile/desktop context)
          const dashboardUrl = new URL('/dashboard', request.url);
          if (isMobile) {
            dashboardUrl.searchParams.set('view', 'mobile');
          }
          return NextResponse.redirect(dashboardUrl);
        }
      } catch (error) {
        console.error('[Middleware] Error checking premium status:', error);
        // Continue to page if check fails
      }
    }

    // If non-premium user tries to access dashboard, redirect to home
    if (pathname.startsWith('/dashboard') && user) {
      try {
        // Check for super admin first (always allowed)
        const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '')
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0);
        
        const isSuperAdmin = SUPER_ADMIN_EMAILS.length > 0 && 
          user.email && 
          SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        if (!isSuperAdmin) {
          // Check for regular premium entitlements
          const { data: entitlements } = await supabase
            .from('entitlements')
            .select('tier, expires_at, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);
          
          // Check if user has active entitlement that hasn't expired
          const isPremium = entitlements && entitlements.length > 0 && (
            entitlements[0].expires_at === null || 
            new Date(entitlements[0].expires_at) > new Date()
          );
          
          if (!isPremium) {
            // Not premium - redirect to home
            return NextResponse.redirect(new URL('/', request.url));
          }
        }
      } catch (error) {
        console.error('[Middleware] Error checking dashboard access:', error);
      }
    }

    // Redirect mobile users to /mobile (unless they're premium - already handled above)
    if (isMobile && pathname === '/' && !user) {
      const redirectUrl = new URL('/mobile', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Protected routes that require authentication
    const protectedPaths = ['/setup', '/interview', '/report', '/dashboard'];
    const isProtectedRoute = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Redirect to sign-in if accessing protected route without auth
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/sign-in', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to dashboard if authenticated premium user tries to access sign-in
    if (request.nextUrl.pathname.startsWith('/sign-in') && user) {
      try {
        // Check for super admin first (always redirect to dashboard)
        const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '')
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0);
        
        const isSuperAdmin = SUPER_ADMIN_EMAILS.length > 0 && 
          user.email && 
          SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        if (isSuperAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        
        // Check for regular premium entitlements
        const { data: entitlements } = await supabase
          .from('entitlements')
          .select('tier, expires_at, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Check if user has active entitlement that hasn't expired
        const isPremium = entitlements && entitlements.length > 0 && (
          entitlements[0].expires_at === null || 
          new Date(entitlements[0].expires_at) > new Date()
        );
        
        if (isPremium) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        console.error('[Middleware] Error checking sign-in redirect:', error);
      }
      // Default to home for non-premium users
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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
      `connect-src 'self' ${supabaseUrl} https://api.openai.com https://api.stripe.com https://challenges.cloudflare.com`,
      `media-src 'self' blob: ${supabaseUrl}`,
      'frame-src https://challenges.cloudflare.com',
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
  } catch (error) {
    // Log error but allow request to proceed
    console.error('[Middleware] Error:', error);
    return NextResponse.next({
      request,
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (API routes handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
