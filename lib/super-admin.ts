/**
 * Super Admin System
 *
 * Super admins have no usage limits or restrictions:
 * - Unlimited free assessments (no 7-day cooldown)
 * - Full access to all premium features without payment
 * - No rate limiting
 * - Bypass all entitlement checks
 */

import { createClient } from '@/lib/supabase-server';

/**
 * List of super admin email addresses
 * Configured via SUPER_ADMIN_EMAILS environment variable
 * Format: comma-separated email addresses
 * Example: "admin@example.com,dev@example.com"
 */
const SUPER_ADMIN_EMAILS: string[] = (process.env.SUPER_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

/**
 * Check if a user ID belongs to a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  if (SUPER_ADMIN_EMAILS.length === 0) {
    return false;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return false;
    }

    const userEmail = user.email?.toLowerCase();
    if (!userEmail) {
      return false;
    }

    return SUPER_ADMIN_EMAILS.includes(userEmail);
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Check if the currently authenticated user is a super admin
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    return isSuperAdmin(user.id);
  } catch (error) {
    console.error('Error checking current user super admin status:', error);
    return false;
  }
}
