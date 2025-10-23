/**
 * Stripe Checkout for Time-Based Access Passes
 */

import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  });
}

const PRICE_IDS = {
  '48h': 'price_1SLIBPGxG7w25PVE72T4bxzN',
  '7d': 'price_1SLIEJGxG7w25PVE7IOqCYHt',
  '30d': 'price_1SLIRvGxG7w25PVEYdrUULvt',
  lifetime: 'price_1SLITdGxG7w25PVEkDNFxB8I',
} as const;

export type PassTier = keyof typeof PRICE_IDS;

export async function createCheckoutSession(
  userId: string,
  tier: PassTier
): Promise<string> {
  const priceId = PRICE_IDS[tier];

  if (!priceId) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: {
      user_id: userId,
      pass_tier: tier,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return session.url;
}
