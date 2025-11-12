'use client';

import { useEffect, useState } from 'react';

interface Company {
  name: string;
  logoUrl: string;
}

const companies: Company[] = [
  {
    name: 'Goldman Sachs',
    logoUrl: 'https://cdn.simpleicons.org/goldmansachs',
  },
  {
    name: 'McKinsey & Company',
    logoUrl: 'https://logo.clearbit.com/mckinsey.com',
  },
  {
    name: 'Google',
    logoUrl: 'https://cdn.simpleicons.org/google',
  },
  {
    name: 'Deloitte',
    logoUrl: 'https://logo.clearbit.com/deloitte.com',
  },
  {
    name: 'HSBC',
    logoUrl: 'https://cdn.simpleicons.org/hsbc',
  },
  {
    name: 'Vodafone',
    logoUrl: 'https://cdn.simpleicons.org/vodafone',
  },
  {
    name: 'Turner & Townsend',
    logoUrl: 'https://logo.clearbit.com/turnerandtownsend.com',
  },
  {
    name: 'BP',
    logoUrl: 'https://logo.clearbit.com/bp.com',
  },
  {
    name: 'Macquarie Group',
    logoUrl: 'https://logo.clearbit.com/macquarie.com',
  },
  {
    name: 'Arup',
    logoUrl: 'https://logo.clearbit.com/arup.com',
  },
  {
    name: 'Rio Tinto',
    logoUrl: 'https://logo.clearbit.com/riotinto.com',
  },
  {
    name: 'Atlassian',
    logoUrl: 'https://cdn.simpleicons.org/atlassian',
  },
];

export function ScrollingBanner() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Triple the array for seamless loop (need more copies for pill spacing)
  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <div className="w-full py-8 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Title */}
        <h3 className="text-center text-sm font-light text-slate-600 mb-6 tracking-wide">
          Join candidates who turned practice into offers at
        </h3>
      </div>

      {/* Scrolling Container with Mask - Full width on mobile */}
      <div className="relative overflow-hidden px-3 md:px-0">
        <div className="md:container md:mx-auto">
          {/* Scrolling wrapper with gradient mask for smooth fade */}
          <div
            className={`flex items-center gap-3 md:gap-4 scroll-mask ${
              prefersReducedMotion ? '' : 'animate-scroll-pills'
            } hover:pause-animation`}
            style={{
              width: 'fit-content',
            }}
          >
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 group"
              >
                {/* Pill Badge */}
                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow duration-300">
                  {/* Company Logo */}
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 object-contain"
                    loading="lazy"
                  />

                  {/* Company Name */}
                  <span className="text-slate-700 font-medium text-sm md:text-base whitespace-nowrap">
                    {company.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollPills {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }

        .animate-scroll-pills {
          animation: scrollPills 50s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }

        /* Gradient mask for smooth edge fades */
        .scroll-mask {
          /* Mobile: Fade starts at 15px, fully visible by 35px (20px fade zone) */
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 35px,
            black calc(100% - 35px),
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 35px,
            black calc(100% - 35px),
            transparent 100%
          );
        }

        @media (min-width: 768px) {
          .scroll-mask {
            /* Desktop: More spacious fade zones */
            -webkit-mask-image: linear-gradient(
              to right,
              transparent 0%,
              black 60px,
              black calc(100% - 60px),
              transparent 100%
            );
            mask-image: linear-gradient(
              to right,
              transparent 0%,
              black 60px,
              black calc(100% - 60px),
              transparent 100%
            );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-pills {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
