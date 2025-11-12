'use client';

import { useEffect, useState } from 'react';

interface Company {
  name: string;
  brandColor: string;
  textColor: string;
  logoLetter: string;
}

const companies: Company[] = [
  {
    name: 'Goldman Sachs',
    brandColor: '#0B4DA2',
    textColor: '#FFFFFF',
    logoLetter: 'GS',
  },
  {
    name: 'McKinsey & Company',
    brandColor: '#00338D',
    textColor: '#FFFFFF',
    logoLetter: 'M',
  },
  {
    name: 'Google',
    brandColor: '#4285F4',
    textColor: '#FFFFFF',
    logoLetter: 'G',
  },
  {
    name: 'Deloitte',
    brandColor: '#86BC25',
    textColor: '#000000',
    logoLetter: 'D',
  },
  {
    name: 'HSBC',
    brandColor: '#DB0011',
    textColor: '#FFFFFF',
    logoLetter: 'H',
  },
  {
    name: 'Vodafone',
    brandColor: '#E60000',
    textColor: '#FFFFFF',
    logoLetter: 'V',
  },
  {
    name: 'Turner & Townsend',
    brandColor: '#E2231A',
    textColor: '#FFFFFF',
    logoLetter: 'TT',
  },
  { name: 'BP', brandColor: '#00693E', textColor: '#FFFFFF', logoLetter: 'BP' },
  {
    name: 'Macquarie Group',
    brandColor: '#074F3F',
    textColor: '#FFFFFF',
    logoLetter: 'M',
  },
  {
    name: 'Arup',
    brandColor: '#F0553C',
    textColor: '#FFFFFF',
    logoLetter: 'A',
  },
  {
    name: 'Rio Tinto',
    brandColor: '#C8102E',
    textColor: '#FFFFFF',
    logoLetter: 'RT',
  },
  {
    name: 'Atlassian',
    brandColor: '#0052CC',
    textColor: '#FFFFFF',
    logoLetter: 'A',
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

        {/* Scrolling Container with Mask */}
        <div className="relative overflow-hidden">
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
                  {/* Brand Logo Badge */}
                  <div
                    className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0 font-bold text-xs md:text-sm shadow-sm"
                    style={{
                      backgroundColor: company.brandColor,
                      color: company.textColor,
                    }}
                  >
                    {company.logoLetter}
                  </div>

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
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 40px,
            black calc(100% - 40px),
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 40px,
            black calc(100% - 40px),
            transparent 100%
          );
        }

        @media (min-width: 768px) {
          .scroll-mask {
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
