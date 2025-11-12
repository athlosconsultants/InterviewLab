'use client';

import { useEffect, useState } from 'react';

const companies = [
  'Goldman Sachs',
  'McKinsey & Company',
  'Google',
  'Deloitte',
  'HSBC',
  'Vodafone',
  'Turner & Townsend',
  'BP',
  'Macquarie Group',
  'Arup',
  'Rio Tinto',
  'Atlassian',
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

  // Double the array for seamless loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="w-full bg-gradient-to-r from-cyan-50/40 via-blue-50/50 to-cyan-50/40 py-8 overflow-hidden border-y border-cyan-100/50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        {/* Title */}
        <h3 className="text-center text-sm font-light text-slate-600 mb-6 tracking-wide">
          Join candidates who turned practice into offers at
        </h3>

        {/* Scrolling Container */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-cyan-50/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-cyan-50/90 to-transparent z-10 pointer-events-none" />

          {/* Scrolling wrapper */}
          <div
            className={`flex ${
              prefersReducedMotion ? '' : 'animate-scroll'
            } hover:pause-animation`}
            style={{
              width: 'fit-content',
            }}
          >
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`${company}-${index}`}
                className="flex-shrink-0 px-8 md:px-12"
              >
                <span className="text-slate-700 font-medium text-base md:text-lg whitespace-nowrap">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 45s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
