'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TIER_CONFIGS } from '@/lib/schema';

interface LowBalanceUpsellDialogProps {
  open: boolean;
  onClose: () => void;
  remainingInterviews: number;
  currentTier: 'starter' | 'professional' | 'elite' | null;
}

/**
 * T140 - Phase 13: Low Balance Upsell Dialog
 * Shows after interview completion when balance < 2
 * Encourages upgrading to larger packs
 */
export function LowBalanceUpsellDialog({
  open,
  onClose,
  remainingInterviews,
  currentTier,
}: LowBalanceUpsellDialogProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  // Determine recommended tier based on current tier
  const recommendedTier =
    currentTier === 'starter'
      ? TIER_CONFIGS.professional
      : currentTier === 'professional'
        ? TIER_CONFIGS.elite
        : TIER_CONFIGS.elite;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            {remainingInterviews === 0
              ? 'Out of Interviews!'
              : `Only ${remainingInterviews} Interview${remainingInterviews === 1 ? '' : 's'} Left`}
          </DialogTitle>
          <DialogDescription className="text-base">
            Don&apos;t let your momentum stop now. Upgrade to keep practicing
            and unlock advanced features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recommended Tier Highlight */}
          <div className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <p className="font-bold text-lg">
                Recommended: {recommendedTier.name}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {recommendedTier.description}
            </p>

            <div className="space-y-2 mb-4">
              {recommendedTier.highlights.slice(0, 3).map((highlight) => (
                <div key={highlight} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {recommendedTier.currency === 'USD' ? '$' : 'AU$'}
                {recommendedTier.price}
              </span>
              <span className="text-muted-foreground text-sm">one-time</span>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">
              {recommendedTier.tier === 'elite'
                ? '🏆 Elite Pack Benefits:'
                : '📈 Professional Pack Benefits:'}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {recommendedTier.tier === 'elite' ? (
                <>
                  <li>• Priority AI Engine for faster, smarter feedback</li>
                  <li>• Confidence Score Report with detailed breakdown</li>
                  <li>• Advanced analytics & performance tracking</li>
                </>
              ) : (
                <>
                  <li>• Multi-stage interview simulations</li>
                  <li>• Advanced analytics & insights</li>
                  <li>• More practice = Better performance</li>
                </>
              )}
            </ul>
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground italic">
              &ldquo;The more I practiced, the more confident I felt. Worth
              every penny!&rdquo; — Sarah K.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3 mt-2">
          <Button
            onClick={handleUpgrade}
            className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            View All Packages
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full h-11">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
