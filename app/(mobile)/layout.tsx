'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/useIsMobile';
import { Header } from '@/components/header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

/**
 * Mobile Route Layout
 *
 * Renders a mobile-optimized layout for routes under the (mobile) group.
 * Automatically redirects desktop users to the main site.
 *
 * Route group: app/(mobile)/*
 */
export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();

  // Redirect desktop users to main site
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      console.log('[MobileLayout] Desktop detected, redirecting to main site');
      router.push('/');
    }
  }, [isMobile, router]);

  // Show mobile layout for mobile users
  if (isMobile) {
    console.log('[MobileLayout] Rendering mobile-optimized layout');

    return (
      <html lang="en">
        <body className="mobile-layout">
          {/* Mobile-optimized header (could be customized) */}
          <Header />

          {/* Main mobile content */}
          <main className="min-h-screen">{children}</main>

          {/* Mobile-optimized footer */}
          <Footer />

          {/* Global components */}
          <Toaster />
          <Analytics />
        </body>
      </html>
    );
  }

  // Return null while redirecting desktop users
  return null;
}
