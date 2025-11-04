import { createClient } from '@/lib/supabase-server';
import { getUserEntitlements } from '@/lib/entitlements';
import { calculateDashboardStats } from '@/lib/dashboard-stats';
import { NextResponse } from 'next/server';

/**
 * API endpoint to fetch premium dashboard data for client-side rendering
 * Used by mobile landing page (which is a client component)
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check entitlements
  const entitlement = await getUserEntitlements(user.id);

  if (!entitlement.isActive) {
    return NextResponse.json({
      hasActivePass: false,
    });
  }

  // Calculate dashboard stats
  const stats = await calculateDashboardStats(user.id);
  const userName = user.email?.split('@')[0] || 'there';

  return NextResponse.json({
    hasActivePass: true,
    tier: entitlement.tier,
    expiresAt: entitlement.expiresAt,
    isSuperAdmin: entitlement.isSuperAdmin || false,
    stats,
    userName,
  });
}
