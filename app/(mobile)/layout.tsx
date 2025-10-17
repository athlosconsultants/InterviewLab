'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/useIsMobile';

/**
 * Mobile Route Layout
 *
 * Renders a mobile-optimized layout for routes under the (mobile) group.
 * Automatically redirects desktop users to the main site.
 *
 * Route group: app/(mobile)/*
 *
 * Note: This layout wraps the page content. The root layout (app/layout.tsx)
 * provides the HTML structure, header, footer, and global components.
 */
export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isReady } = useIsMobile();
  const router = useRouter();

  // Redirect desktop users to main site (only after detection is ready)
  useEffect(() => {
    if (isReady && !isMobile && typeof window !== 'undefined') {
      console.log('[MobileLayout] Desktop detected, redirecting to main site');
      router.push('/');
    }
  }, [isReady, isMobile, router]);

  // Log mobile layout rendering
  useEffect(() => {
    if (isReady && isMobile) {
      console.log('[MobileLayout] Rendering mobile-optimized layout');
    }
  }, [isReady, isMobile]);

  // Always render children (root layout provides HTML structure)
  // The redirect happens via useEffect above
  return <div className="mobile-layout-wrapper">{children}</div>;
}
