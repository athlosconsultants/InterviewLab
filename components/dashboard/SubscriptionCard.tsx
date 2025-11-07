'use client';

import { Award, Clock, TrendingUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface SubscriptionCardProps {
  tier: string;
  expiresAt: string | null;
  isSuperAdmin: boolean;
  totalInterviews: number;
  memberSince?: string;
}

/**
 * Subscription Management Widget
 * Displays plan-specific details, usage stats, and renewal prompts
 * Adapts UI based on subscription type (48h, 7d, 30d, lifetime)
 */
export function SubscriptionCard({
  tier,
  expiresAt,
  isSuperAdmin,
  totalInterviews,
  memberSince,
}: SubscriptionCardProps) {
  // Plan display names and pricing
  const getPlanDetails = () => {
    if (isSuperAdmin) {
      return {
        name: 'Super Admin Access',
        badge: 'Unlimited',
        color: 'from-purple-500 to-indigo-600',
      };
    }

    switch (tier) {
      case 'lifetime':
        return {
          name: 'Lifetime Access',
          badge: 'Best Value',
          price: 199.99,
          color: 'from-yellow-500 to-orange-600',
        };
      case '30d':
        return {
          name: 'The Career Investment',
          badge: 'Active',
          price: 99.99,
          duration: '30 Days',
          color: 'from-green-500 to-emerald-600',
        };
      case '7d':
        return {
          name: 'The Standard Prep',
          badge: 'Most Popular',
          price: 59.99,
          duration: '7 Days',
          color: 'from-cyan-500 to-blue-600',
        };
      case '48h':
        return {
          name: 'The Weekend Warrior',
          badge: '48 Hours',
          price: 29.99,
          duration: '2 Days',
          color: 'from-orange-500 to-red-600',
        };
      default:
        return {
          name: 'Premium Access',
          badge: 'Active',
          color: 'from-slate-500 to-slate-600',
        };
    }
  };

  const planDetails = getPlanDetails();

  // Calculate days/hours remaining
  const getTimeRemaining = () => {
    if (!expiresAt || isSuperAdmin || tier === 'lifetime') return null;

    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return { expired: true, text: 'Expired' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return {
        expired: false,
        days,
        hours,
        text: `${days} day${days !== 1 ? 's' : ''} ${hours}h`,
        urgent: days <= 3,
      };
    } else if (hours > 0) {
      return { expired: false, hours, text: `${hours} hours`, urgent: true };
    } else {
      return {
        expired: false,
        text: 'Less than 1 hour',
        urgent: true,
      };
    }
  };

  const timeRemaining = getTimeRemaining();

  // Lifetime plan rendering
  if (tier === 'lifetime' || isSuperAdmin) {
    return (
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
        <div
          className={`bg-gradient-to-r ${planDetails.color} p-6 rounded-xl text-white mb-6`}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">{planDetails.name}</h3>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                {planDetails.badge}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!isSuperAdmin && planDetails.price && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900">
                <strong>Never pay for interview prep again!</strong>
              </p>
              <p className="text-xs text-green-700 mt-1">
                You saved A${(planDetails.price - 99.99 * 2).toFixed(2)}+ vs
                buying 30-day passes
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {memberSince && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-[#64748B] mb-1">Member since</p>
                <p className="text-sm font-semibold text-[#1E293B]">
                  {formatDistanceToNow(new Date(memberSince), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-[#64748B] mb-1">
                Interviews completed
              </p>
              <p className="text-sm font-semibold text-[#1E293B]">
                {totalInterviews}
              </p>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-900 flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0" /> Unlimited interviews forever
            </p>
            <p className="text-sm text-cyan-900 flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0" /> Every promotion, job change, career pivot
            </p>
            <p className="text-sm text-cyan-900 flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0" /> Used by professionals across 50+ industries
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Time-limited plan rendering
  return (
    <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
      <div
        className={`bg-gradient-to-r ${planDetails.color} p-6 rounded-xl text-white mb-6`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">{planDetails.name}</h3>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
              {planDetails.badge}
            </span>
          </div>
          {timeRemaining && (
            <div
              className={`text-right ${timeRemaining.urgent ? 'animate-pulse' : ''}`}
            >
              <p className="text-xs opacity-90 mb-1">Time remaining</p>
              <p className="text-xl font-bold">{timeRemaining.text}</p>
            </div>
          )}
        </div>

        {/* Progress bar for time-limited plans */}
        {timeRemaining && !timeRemaining.expired && expiresAt && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all`}
                style={{
                  width: `${
                    100 -
                    ((new Date(expiresAt).getTime() - Date.now()) /
                      (tier === '48h'
                        ? 48 * 60 * 60 * 1000
                        : tier === '7d'
                          ? 7 * 24 * 60 * 60 * 1000
                          : 30 * 24 * 60 * 60 * 1000)) *
                      100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-[#64748B] mb-1">Interviews completed</p>
            <p className="text-sm font-semibold text-[#1E293B]">
              {totalInterviews} / unlimited
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-[#64748B] mb-1">Daily rate</p>
            <p className="text-sm font-semibold text-[#1E293B]">
              {planDetails.price
                ? `A$${(
                    planDetails.price /
                    (tier === '48h' ? 2 : tier === '7d' ? 7 : 30)
                  ).toFixed(2)}/day`
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Renewal prompt for expiring plans */}
        {timeRemaining && timeRemaining.urgent && !timeRemaining.expired && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {timeRemaining.days
                ? `Only ${timeRemaining.days} day${timeRemaining.days !== 1 ? 's' : ''} left!`
                : 'Time is running out!'}
            </p>
            <p className="text-xs text-orange-800 mb-3">
              Upgrade to Lifetime and never pay again, or extend your current
              plan.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 border-orange-300 hover:bg-orange-100"
              >
                <Link href="/pricing">Go Lifetime →</Link>
              </Button>
            </div>
          </div>
        )}

        {timeRemaining && timeRemaining.expired && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-2">
              Your access has expired
            </p>
            <p className="text-xs text-red-800 mb-3">
              Renew your plan to continue practicing.
            </p>
            <Button
              size="sm"
              asChild
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <Link href="/pricing">View Plans →</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
