/**
 * Whop SDK Integration
 * Uses the official @whop/api package
 */

import { WhopServerSdk } from '@whop/api';

// Environment variables
const WHOP_API_KEY = process.env.WHOP_API_KEY;
const WHOP_APP_ID =
  process.env.NEXT_PUBLIC_WHOP_APP_ID || process.env.WHOP_CLIENT_ID;

if (!WHOP_API_KEY || !WHOP_APP_ID) {
  console.error('[Whop SDK] Missing WHOP_API_KEY or NEXT_PUBLIC_WHOP_APP_ID');
}

export const whopApi = WhopServerSdk({
  appApiKey: WHOP_API_KEY!,
  appId: WHOP_APP_ID!,
});

/**
 * Exchange OAuth code for access token using Whop SDK
 */
export async function exchangeWhopCode(
  code: string,
  redirectUri: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}> {
  try {
    console.log('[Whop SDK] Exchanging code for token');
    console.log('[Whop SDK] Redirect URI:', redirectUri);
    console.log('[Whop SDK] Code length:', code?.length);

    const authResponse = await whopApi.oauth.exchangeCode({
      code,
      redirectUri,
    });

    if (!authResponse.ok) {
      console.error('[Whop SDK] Code exchange failed:', authResponse.error);
      return {
        success: false,
        error: authResponse.error?.message || 'Failed to exchange code',
      };
    }

    console.log('[Whop SDK] Code exchange successful');

    return {
      success: true,
      accessToken: authResponse.tokens.access_token,
      refreshToken: authResponse.tokens.refresh_token,
    };
  } catch (error) {
    console.error('[Whop SDK] Error exchanging code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal error',
    };
  }
}

/**
 * Get OAuth authorization URL
 */
export function getWhopOAuthUrl(redirectUri: string): string {
  try {
    const { url } = whopApi.oauth.getAuthorizationUrl({
      redirectUri,
      scope: ['read_user'],
    });

    return url;
  } catch (error) {
    console.error('[Whop SDK] Error generating OAuth URL:', error);
    return '#';
  }
}
