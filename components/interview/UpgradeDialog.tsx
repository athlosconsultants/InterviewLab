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
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onViewReport: () => void;
}

/**
 * T138 - Phase 13: Value-Stacked Upgrade Dialog
 * Hormozi-inspired copy to drive conversions
 */
export function UpgradeDialog({
  open,
  onClose,
  onViewReport,
}: UpgradeDialogProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            Ready to Transform Your Interview Skills?
          </DialogTitle>
          <DialogDescription className="text-base">
            You&apos;ve completed your free practice. Now unlock the full power of
            AI-driven interview coaching.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Value Stack */}
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50 dark:to-purple-950/20 p-6">
            <p className="font-bold text-lg mb-4 text-center">
              Unlock Premium Features:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">3-10 Full Interviews</span>
                  <p className="text-xs text-muted-foreground">
                    Practice as much as you need
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Voice Mode</span>
                  <p className="text-xs text-muted-foreground">
                    Real-time AI interviewer with TTS & STT
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Multi-Stage Interviews</span>
                  <p className="text-xs text-muted-foreground">
                    Simulate real company processes
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Detailed Feedback & Analytics</span>
                  <p className="text-xs text-muted-foreground">
                    Actionable insights to improve faster
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Adaptive Difficulty</span>
                  <p className="text-xs text-muted-foreground">
                    Questions that match your skill level
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Pricing Teaser */}
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Packages starting at <span className="font-bold text-foreground">$26.99</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              One-time payment • No subscription
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={handleUpgrade}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            View Premium Packages
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={onViewReport}
              className="flex-1"
            >
              View Free Report
            </Button>
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
