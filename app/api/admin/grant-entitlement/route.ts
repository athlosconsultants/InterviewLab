/**
 * DEPRECATED: This endpoint was for the old credit-based system
 * Use the new time-based access pass system via Stripe instead
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint is deprecated. Use Stripe checkout for access passes.',
    },
    { status: 410 }
  );
}
