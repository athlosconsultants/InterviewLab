import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getUserEntitlements } from '@/lib/entitlements';

/**
 * API endpoint to check user's entitlement status
 * Used by client-side components to determine if user has active premium pass
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { isActive: false, tier: null, expiresAt: null },
        { status: 401 }
      );
    }

    const entitlement = await getUserEntitlements(user.id);

    return NextResponse.json({
      isActive: entitlement.isActive,
      tier: entitlement.tier,
      expiresAt: entitlement.expiresAt,
      isSuperAdmin: entitlement.isSuperAdmin || false,
    });
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return NextResponse.json(
      { error: 'Failed to check entitlement' },
      { status: 500 }
    );
  }
}
