import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { TIER_CONFIGS, type EntitlementTier } from '@/lib/schema';

/**
 * T134 - Phase 13: Stripe Webhook Handler
 * Processes successful payments and grants entitlements
 */
export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeSecretKey) {
      console.error('[T134 Webhook] Missing STRIPE_SECRET_KEY environment variable');
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }
    
    if (!webhookSecret) {
      console.error('[T134 Webhook] Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook configuration missing' },
        { status: 500 }
      );
    }

    // Lazy-initialize Stripe to avoid build-time errors
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[T134 Webhook] Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[T134 Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[T134 Webhook] Received event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(`[T134 Webhook] Processing checkout session: ${session.id}`);

      // Extract metadata
      const userId = session.metadata?.user_id || session.client_reference_id;
      const tier = session.metadata?.tier as EntitlementTier;
      const purchaseType = session.metadata?.purchase_type;
      const interviewCount = parseInt(session.metadata?.interview_count || '0');

      if (!userId || !tier || !purchaseType) {
        console.error('[T134 Webhook] Missing required metadata:', {
          userId,
          tier,
          purchaseType,
        });
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      // Get tier config
      const tierConfig = TIER_CONFIGS[tier];

      // Create Supabase client with service role (bypasses RLS)
      const supabase = createServiceRoleClient();

      // Check if user already has an active entitlement for this purchase
      const { data: existingEntitlements } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('tier', tier);

      let entitlementId: string;
      let previousBalance = 0;
      let newBalance = interviewCount;

      if (existingEntitlements && existingEntitlements.length > 0) {
        // User already has an entitlement of this tier - add to existing balance
        const existingEntitlement = existingEntitlements[0];
        previousBalance = (existingEntitlement as any).remaining_interviews || 0;
        newBalance = previousBalance + interviewCount;
        entitlementId = existingEntitlement.id;

        // Update existing entitlement
        const { error: updateError } = await supabase
          .from('entitlements')
          .update({
            remaining_interviews: newBalance,
            stripe_session_id: session.id,
            metadata: {
              ...((existingEntitlement.metadata as any) || {}),
              last_purchase: new Date().toISOString(),
              purchases: [
                ...((existingEntitlement.metadata as any)?.purchases || []),
                {
                  session_id: session.id,
                  amount: session.amount_total,
                  currency: session.currency,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          })
          .eq('id', existingEntitlement.id);

        if (updateError) {
          console.error('[T134 Webhook] Failed to update entitlement:', updateError);
          throw updateError;
        }

        console.log(
          `[T134 Webhook] Updated entitlement ${entitlementId}: ${previousBalance} → ${newBalance} interviews`
        );
      } else {
        // Create new entitlement
        const { data: newEntitlement, error: insertError } = await supabase
          .from('entitlements')
          .insert({
            user_id: userId,
            type: 'interview_package',
            status: 'active',
            tier: tier,
            purchase_type: purchaseType,
            remaining_interviews: interviewCount,
            perks: tierConfig.perks,
            stripe_session_id: session.id,
            currency: tierConfig.currency,
            metadata: {
              session_id: session.id,
              amount_paid: session.amount_total,
              currency: session.currency,
              purchased_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (insertError || !newEntitlement) {
          console.error('[T134 Webhook] Failed to create entitlement:', insertError);
          throw insertError;
        }

        entitlementId = newEntitlement.id;

        console.log(
          `[T134 Webhook] Created new entitlement ${entitlementId} with ${interviewCount} interviews`
        );
      }

      // Log the purchase in entitlement_history
      const { error: historyError } = await supabase
        .from('entitlement_history')
        .insert({
          user_id: userId,
          entitlement_id: entitlementId,
          action: 'purchase',
          previous_balance: previousBalance,
          new_balance: newBalance,
          metadata: {
            tier: tier,
            purchase_type: purchaseType,
            stripe_session_id: session.id,
            amount: session.amount_total,
            currency: session.currency,
          },
        });

      if (historyError) {
        console.error('[T134 Webhook] Failed to log history:', historyError);
        // Don't throw - this is not critical
      }

      console.log(
        `[T134 Webhook] Successfully processed purchase for user ${userId}: ${tier} pack (${interviewCount} interviews)`
      );

      return NextResponse.json({
        success: true,
        entitlementId,
        balance: newBalance,
      });
    }

    // Return 200 for unhandled event types
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[T134 Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

