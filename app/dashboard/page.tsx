/**
 * Premium User Dashboard
 * Dedicated route for premium users - accessed via middleware redirect
 * Prevents flash of free landing page by separating premium/free routes
 */

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { PremiumLandingView } from '@/components/landing/PremiumLandingView';
import { Footer } from '@/components/Footer';
import { PrefetchLinks } from '@/components/PrefetchLinks';

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check for active entitlements
  const { isEntitled, getUserEntitlements } = await import('@/lib/entitlements');
  const entitled = await isEntitled(user.id);
  
  if (!entitled) {
    // No active pass - redirect to pricing or home
    redirect('/pricing');
  }

  // Get entitlement details
  const entitlement = await getUserEntitlements(user.id);
  
  // Calculate dashboard stats
  const { calculateDashboardStats } = await import('@/lib/dashboard-stats');
  const stats = await calculateDashboardStats(user.id);
  
  // Check if user has uploaded CV
  const { data: cvDocs } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'cv')
    .limit(1);
  const hasCv = !!(cvDocs && cvDocs.length > 0);

  return (
    <>
      <PrefetchLinks />
      <PremiumLandingView
        tier={entitlement.tier}
        expiresAt={entitlement.expiresAt}
        isSuperAdmin={entitlement.isSuperAdmin || false}
        stats={stats}
        hasCv={hasCv}
      />
      <Footer />
    </>
  );
}

