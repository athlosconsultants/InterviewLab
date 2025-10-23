'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type PassTier = '48h' | '7d' | '30d' | 'lifetime';

const TIERS = {
  '48h': { name: '48 Hour Pass', price: 'A$29.99', duration: '48 hours' },
  '7d': { name: '7 Day Pass', price: 'A$59.99', duration: '7 days' },
  '30d': { name: '30 Day Pass', price: 'A$99.99', duration: '30 days' },
  lifetime: { name: 'Lifetime Pass', price: 'A$199.99', duration: 'Forever' },
};

export default function PricingPage() {
  const [loading, setLoading] = useState<PassTier | null>(null);

  const handlePurchase = async (tier: PassTier) => {
    setLoading(tier);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error('Please sign in first');
        window.location.href = '/sign-in?redirect=/pricing';
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      );
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Access Pass</h1>
          <p className="text-xl text-muted-foreground">
            Unlimited interviews for the duration of your pass
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {(Object.keys(TIERS) as PassTier[]).map((tier) => {
            const config = TIERS[tier];
            const isLifetime = tier === 'lifetime';

            return (
              <div
                key={tier}
                className={`relative rounded-2xl border-2 p-8 ${
                  isLifetime
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                {isLifetime && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{config.name}</h3>
                  <div className="text-3xl font-bold mb-1">{config.price}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.duration}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Unlimited interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Full feedback reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Voice & text modes</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handlePurchase(tier)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={isLifetime ? 'default' : 'outline'}
                >
                  {loading === tier ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
