import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { TIER_CONFIGS, type EntitlementTier } from '@/lib/schema';

/**
 * T134 - Phase 13: Create Stripe Checkout Session
 * Creates a checkout session for purchasing interview packs
 */
export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('[T134] Missing STRIPE_SECRET_KEY environment variable');
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    // Lazy-initialize Stripe to avoid build-time errors
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body as { tier: EntitlementTier };

    // Validate tier
    if (!tier || !['starter', 'professional', 'elite'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get tier configuration
    const tierConfig = TIER_CONFIGS[tier];

    // Determine the price ID from environment variables
    const priceId =
      tier === 'starter'
        ? process.env.STRIPE_PRICE_STARTER
        : tier === 'professional'
          ? process.env.STRIPE_PRICE_PROFESSIONAL
          : process.env.STRIPE_PRICE_ELITE;

    if (!priceId) {
      console.error(`[T134] Missing Stripe price ID for tier: ${tier}`);
      return NextResponse.json(
        { error: 'Price configuration missing' },
        { status: 500 }
      );
    }

    // Get site URL from environment
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing?cancelled=true`,
      client_reference_id: user.id, // Link to our user
      metadata: {
        user_id: user.id,
        tier: tier,
        purchase_type: tierConfig.purchase_type,
        interview_count: tierConfig.interview_count.toString(),
      },
    });

    console.log(`[T134] Checkout session created: ${session.id} for tier: ${tier}`);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[T134] Checkout session creation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

