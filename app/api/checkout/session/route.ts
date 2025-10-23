import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createCheckoutSession, type PassTier } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json();

    if (!tier) {
      return NextResponse.json({ error: 'Missing tier' }, { status: 400 });
    }

    // Create Stripe Checkout session
    const checkoutUrl = await createCheckoutSession(user.id, tier as PassTier);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[Checkout Session] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
