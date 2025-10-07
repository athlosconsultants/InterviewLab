/**
 * API route for checking user entitlements (T86)
 * Returns the user's available and consumed entitlements.
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

    const entitlements = await getUserEntitlements(user.id);

    // Count active entitlements
    const activeCount = entitlements.filter(
      (e) => e.status === 'active' && !e.consumed_at
    ).length;

    return NextResponse.json({
      entitlements,
      activeCount,
      hasActive: activeCount > 0,
    });
  } catch (error) {
    console.error('Get entitlements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
