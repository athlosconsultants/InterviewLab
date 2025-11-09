/**
 * Whop Client-Side Utilities
 *
 * Client-safe functions that can be imported in Client Components
 */

/**
 * Get Whop OAuth authorization URL
 * This is safe to call from client components
 */
export function getWhopOAuthUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/whop/callback`;
  const appId =
    process.env.NEXT_PUBLIC_WHOP_APP_ID ||
    process.env.NEXT_PUBLIC_WHOP_CLIENT_ID;

  if (!appId) {
    console.error(
      '[Whop] Missing NEXT_PUBLIC_WHOP_APP_ID or NEXT_PUBLIC_WHOP_CLIENT_ID'
    );
    return '#';
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read_user',
  });

  return `https://whop.com/oauth?${params.toString()}`;
}
