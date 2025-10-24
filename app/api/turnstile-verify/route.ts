import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Missing token' },
      { status: 400 }
    );
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  // Optionally, pass the user's IP address to Turnstile.
  // This is recommended by Cloudflare for better bot detection.
  const ip = request.headers.get('x-forwarded-for');
  if (ip) {
    formData.append('remoteip', ip);
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid token', details: data['error-codes'] },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
