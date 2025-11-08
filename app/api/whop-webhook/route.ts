/**
 * Whop Webhook Handler
 * 
 * Receives webhook events from Whop when memberships are created, updated, or cancelled
 * Events: membership.went_valid, membership.went_invalid, membership.deleted
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWhopWebhook,
  syncWhopMembershipToSupabase,
  WhopWebhookEvent,
  WhopMembership,
} from '@/lib/whop';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-whop-signature');

    if (!signature) {
      console.error('[Whop Webhook] Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWhopWebhook(body, signature);
    if (!isValid) {
      console.error('[Whop Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook event
    const event: WhopWebhookEvent = JSON.parse(body);
    console.log('[Whop Webhook] Received event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'membership.went_valid':
      case 'membership.went_invalid':
      case 'membership.updated':
        // Sync membership to Supabase
        const membership: WhopMembership = {
          id: event.data.id,
          user_id: event.data.user_id,
          email: event.data.email,
          username: event.data.username,
          product_id: event.data.product_id,
          plan_id: event.data.plan_id,
          status: event.data.status as any,
          expires_at: event.data.expires_at,
          created_at: event.data.created_at,
        };

        const result = await syncWhopMembershipToSupabase(membership);
        
        if (!result.success) {
          console.error('[Whop Webhook] Failed to sync membership:', result.error);
          return NextResponse.json(
            { error: 'Failed to sync membership' },
            { status: 500 }
          );
        }

        console.log('[Whop Webhook] Successfully processed:', event.event);
        break;

      case 'membership.deleted':
        // Handle membership deletion
        console.log('[Whop Webhook] Membership deleted:', event.data.id);
        // TODO: Mark entitlement as cancelled in Supabase
        break;

      default:
        console.log('[Whop Webhook] Unhandled event type:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Whop Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

