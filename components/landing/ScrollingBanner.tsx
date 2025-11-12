'use client';

import { useEffect, useState } from 'react';

interface Company {
  name: string;
  logoUrl: string;
  fallbackUrl?: string;
  brandColor: string;
  logoLetter: string;
}

const companies: Company[] = [
  {
    name: 'Goldman Sachs',
    logoUrl: 'https://cdn.simpleicons.org/goldmansachs',
    brandColor: '#0B4DA2',
    logoLetter: 'GS',
  },
  {
    name: 'McKinsey & Company',
    logoUrl: 'https://logo.clearbit.com/mckinsey.com',
    brandColor: '#00338D',
    logoLetter: 'M',
  },
  {
    name: 'Google',
    logoUrl: 'https://cdn.simpleicons.org/google',
    brandColor: '#4285F4',
    logoLetter: 'G',
  },
  {
    name: 'Deloitte',
    logoUrl: 'https://logo.clearbit.com/deloitte.com',
    brandColor: '#86BC25',
    logoLetter: 'D',
  },
  {
    name: 'HSBC',
    logoUrl: 'https://cdn.simpleicons.org/hsbc',
    brandColor: '#DB0011',
    logoLetter: 'H',
  },
  {
    name: 'Vodafone',
    logoUrl: 'https://cdn.simpleicons.org/vodafone',
    brandColor: '#E60000',
    logoLetter: 'V',
  },
  {
    name: 'Turner & Townsend',
    logoUrl: 'https://logo.clearbit.com/turnerandtownsend.com',
    brandColor: '#E2231A',
    logoLetter: 'TT',
  },
  {
    name: 'BP',
    logoUrl: 'https://logo.clearbit.com/bp.com',
    brandColor: '#00693E',
    logoLetter: 'BP',
  },
  {
    name: 'Macquarie Group',
    logoUrl: 'https://logo.clearbit.com/macquarie.com.au',
    fallbackUrl: 'https://logo.clearbit.com/macquarie.com',
    brandColor: '#074F3F',
    logoLetter: 'M',
  },
  {
    name: 'Arup',
    logoUrl: 'https://logo.clearbit.com/arup.com',
    brandColor: '#F0553C',
    logoLetter: 'A',
  },
  {
    name: 'Rio Tinto',
    logoUrl: 'https://logo.clearbit.com/riotinto.com',
    brandColor: '#C8102E',
    logoLetter: 'RT',
  },
  {
    name: 'Atlassian',
    logoUrl: 'https://cdn.simpleicons.org/atlassian',
    brandColor: '#0052CC',
    logoLetter: 'A',
  },
];

// Component to handle logo loading with fallbacks
function CompanyLogo({ company }: { company: Company }) {
  const [logoSrc, setLogoSrc] = useState(company.logoUrl);
  const [useFallback, setUseFallback] = useState(false);

  const handleError = () => {
    if (!useFallback && company.fallbackUrl) {
      // Try fallback URL first
      setLogoSrc(company.fallbackUrl);
      setUseFallback(true);
    } else {
      // Use letter badge fallback
      setUseFallback(true);
    }
  };

  if (
    useFallback &&
    (!company.fallbackUrl || logoSrc === company.fallbackUrl)
  ) {
    // Render branded letter badge fallback
    return (
      <div
        className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0 font-bold text-xs shadow-sm"
        style={{
          backgroundColor: company.brandColor,
          color: '#FFFFFF',
        }}
      >
        {company.logoLetter}
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={`${company.name} logo`}
      className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 object-contain"
      loading="lazy"
      crossOrigin="anonymous"
      onError={handleError}
    />
  );
}

export function ScrollingBanner() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Quadruple the array for seamless loop on mobile (need extra copies for smaller screens)
  const duplicatedCompanies = [
    ...companies,
    ...companies,
    ...companies,
    ...companies,
  ];

  return (
    <div
      className="w-full py-8 block"
      data-component="scrolling-banner"
      data-version="2024-11-12-mobile-logo-fix"
      style={{ display: 'block', visibility: 'visible' }}
    >
      <div className="container mx-auto px-6">
        {/* Title */}
        <h3 className="text-center text-sm font-light text-slate-600 mb-6 tracking-wide block">
          Join candidates who turned practice into offers at
        </h3>
      </div>

      {/* Scrolling Container with Mask - Full width on mobile */}
      <div
        className="relative px-3 md:px-0 block"
        style={{
          display: 'block',
          overflow: 'visible',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}
      >
        <div
          className="md:container md:mx-auto block"
          style={{ overflow: 'hidden' }}
        >
          {/* Scrolling wrapper with gradient mask for smooth fade */}
          <div
            className={`flex items-center gap-3 md:gap-4 scroll-mask ${
              prefersReducedMotion ? '' : 'animate-scroll-pills'
            } hover:pause-animation`}
            style={{
              width: 'fit-content',
              display: 'flex',
              minWidth: '100%',
            }}
          >
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 group"
              >
                {/* Pill Badge */}
                <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow duration-300">
                  {/* Company Logo with fallback handling */}
                  <CompanyLogo company={company} />

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
        @-webkit-keyframes scrollPills {
          0% {
            -webkit-transform: translateX(0);
            transform: translateX(0);
          }
          100% {
            -webkit-transform: translateX(-25%);
            transform: translateX(-25%);
          }
        }

        @keyframes scrollPills {
          0% {
            -webkit-transform: translateX(0);
            transform: translateX(0);
          }
          100% {
            -webkit-transform: translateX(-25%);
            transform: translateX(-25%);
          }
        }

        .animate-scroll-pills {
          animation: scrollPills 50s linear infinite;
          will-change: transform;
          -webkit-animation: scrollPills 50s linear infinite;
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
