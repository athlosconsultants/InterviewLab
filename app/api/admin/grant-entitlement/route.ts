/**
 * TEST/ADMIN ONLY: Grant entitlements manually
 * T86 - This endpoint is for testing purposes until payment system is implemented.
 * In production, this should be protected by admin authentication.
 */

import { createClient } from '@/lib/supabase-server';
import { grantEntitlement } from '@/lib/entitlements';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, add admin role check here
    // For now, any authenticated user can grant themselves an entitlement (for testing)

    const result = await grantEntitlement(user.id, 'interview_package');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to grant entitlement' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entitlementId: result.entitlementId,
      message: 'Entitlement granted successfully',
    });
  } catch (error) {
    console.error('Grant entitlement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
