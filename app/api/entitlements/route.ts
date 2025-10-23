/**
 * API route for checking user entitlements - Time-based access passes
 */

import { createClient } from '@/lib/supabase-server';
import { getUserEntitlements } from '@/lib/entitlements';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entitlement = await getUserEntitlements(user.id);

    return NextResponse.json({
      isActive: entitlement.isActive,
      tier: entitlement.tier,
      expiresAt: entitlement.expiresAt,
    });
  } catch (error) {
    console.error('Get entitlements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
