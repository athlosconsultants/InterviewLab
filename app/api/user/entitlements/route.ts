import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type {
  EntitlementSummary,
  EntitlementPerks,
  EntitlementTier,
} from '@/lib/schema';

/**
 * T136 - Phase 13: Entitlement Summary Endpoint
 * Returns user's current entitlements, remaining interviews, and tier info
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active entitlements for the user
    const { data: entitlements, error: entitlementsError } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (entitlementsError) {
      console.error('[T136] Failed to fetch entitlements:', entitlementsError);
      throw entitlementsError;
    }

    // Calculate total remaining interviews across all entitlements
    const totalRemaining = entitlements?.reduce((sum, ent: any) => {
      return sum + (ent.remaining_interviews || 0);
    }, 0) || 0;

    // Get the highest tier (elite > professional > starter)
    const tierPriority: Record<string, number> = {
      elite: 3,
      professional: 2,
      starter: 1,
    };

    let highestTier: EntitlementTier | null = null;
    let highestTierRank = 0;

    entitlements?.forEach((ent: any) => {
      const tier = ent.tier as EntitlementTier | null;
      if (tier && tierPriority[tier] > highestTierRank) {
        highestTier = tier;
        highestTierRank = tierPriority[tier];
      }
    });

    // Aggregate perks (if user has multiple tiers, use the most permissive perks)
    const aggregatedPerks: EntitlementPerks = {
      voice_mode: false,
      multi_stage: false,
      priority_ai: false,
      advanced_analytics: false,
      confidence_report: false,
    };

    entitlements?.forEach((ent: any) => {
      const perks = ent.perks as EntitlementPerks | null;
      if (perks) {
        // Enable perk if ANY entitlement has it
        if (perks.voice_mode) aggregatedPerks.voice_mode = true;
        if (perks.multi_stage) aggregatedPerks.multi_stage = true;
        if (perks.priority_ai) aggregatedPerks.priority_ai = true;
        if (perks.advanced_analytics) aggregatedPerks.advanced_analytics = true;
        if (perks.confidence_report) aggregatedPerks.confidence_report = true;
      }
    });

    // Fetch consumption history to calculate total consumed
    const { data: history, error: historyError } = await supabase
      .from('entitlement_history')
      .select('action')
      .eq('user_id', user.id)
      .eq('action', 'consume');

    const totalConsumed = history?.length || 0;

    // Build response
    const summary: EntitlementSummary = {
      tier: highestTier,
      remaining_interviews: totalRemaining,
      perks: aggregatedPerks,
      active_entitlements: entitlements || [],
      total_consumed: totalConsumed,
    };

    console.log(
      `[T136] Entitlement summary for user ${user.id}: ${totalRemaining} remaining (tier: ${highestTier || 'free'})`
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[T136] Error fetching entitlement summary:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch entitlement summary',
      },
      { status: 500 }
    );
  }
}

