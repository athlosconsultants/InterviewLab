import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceRoleClient } from '@/lib/supabase-server';

/**
 * Stripe Webhook Handler - Time-Based Access Pass System
 * Processes checkout.session.completed events and creates entitlements
 */
export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error('[Webhook] Missing Stripe configuration');
      return NextResponse.json(
        { error: 'Configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const tier = session.metadata?.pass_tier;

      if (!userId || !tier) {
        console.error('[Webhook] Missing metadata:', { userId, tier });
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      // Calculate expiry date based on tier
      let expiresAt: string | null = null;
      const now = new Date();

      switch (tier) {
        case '48h':
          expiresAt = new Date(
            now.getTime() + 48 * 60 * 60 * 1000
          ).toISOString();
          break;
        case '7d':
          expiresAt = new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString();
          break;
        case '30d':
          expiresAt = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString();
          break;
        case 'lifetime':
          expiresAt = null; // null = never expires
          break;
        default:
          console.error('[Webhook] Invalid tier:', tier);
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }

      // Insert entitlement (use service role client to bypass RLS)
      const supabase = createServiceRoleClient();

      const { data, error } = await supabase
        .from('entitlements')
        .insert({
          user_id: userId,
          tier: tier,
          expires_at: expiresAt,
          stripe_session_id: session.id,
        })
        .select()
        .single();

      if (error) {
        console.error('[Webhook] Failed to create entitlement:', error);
        return NextResponse.json(
          { error: 'Database insert failed' },
          { status: 500 }
        );
      }

      console.log(`[Webhook] Created entitlement for user ${userId}: ${tier}`);

      return NextResponse.json({ success: true, entitlement: data });
    }

    // Return 200 for other event types
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
