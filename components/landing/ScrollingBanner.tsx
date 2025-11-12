'use client';

import { useEffect, useState, useRef } from 'react';

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
    logoUrl: '/logos/goldman-sachs.svg',
    brandColor: '#0B4DA2',
    logoLetter: 'GS',
  },
  {
    name: 'McKinsey & Company',
    logoUrl: '/logos/mckinsey.png',
    brandColor: '#00338D',
    logoLetter: 'M',
  },
  {
    name: 'Google',
    logoUrl: '/logos/google.svg',
    brandColor: '#4285F4',
    logoLetter: 'G',
  },
  {
    name: 'Deloitte',
    logoUrl: '/logos/deloitte.svg',
    brandColor: '#86BC25',
    logoLetter: 'D',
  },
  {
    name: 'HSBC',
    logoUrl: '/logos/hsbc.svg',
    brandColor: '#DB0011',
    logoLetter: 'H',
  },
  {
    name: 'Vodafone',
    logoUrl: '/logos/vodafone.svg',
    brandColor: '#E60000',
    logoLetter: 'V',
  },
  {
    name: 'Turner & Townsend',
    logoUrl: '/logos/turner-townsend.png',
    brandColor: '#E2231A',
    logoLetter: 'TT',
  },
  {
    name: 'BP',
    logoUrl: '/logos/bp.svg',
    brandColor: '#00693E',
    logoLetter: 'BP',
  },
  {
    name: 'Macquarie Group',
    logoUrl: '/logos/macquarie.svg',
    brandColor: '#074F3F',
    logoLetter: 'M',
  },
  {
    name: 'Arup',
    logoUrl: '/logos/arup.jpeg',
    brandColor: '#F0553C',
    logoLetter: 'A',
  },
  {
    name: 'Rio Tinto',
    logoUrl: '/logos/rio-tinto.svg',
    brandColor: '#C8102E',
    logoLetter: 'RT',
  },
  {
    name: 'Atlassian',
    logoUrl: '/logos/atlassian.svg',
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
      loading="eager"
      fetchPriority="high"
      onError={handleError}
    />
  );
}

export function ScrollingBanner() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection Observer for smooth visibility transitions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px', // Start transition 50px before entering viewport
      }
    );

    const currentRef = containerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Quadruple the array to ensure endless scroll on all screen sizes
  // Animation moves 50% (2 full sets), creating a perfect seamless loop
  const duplicatedCompanies = [
    ...companies,
    ...companies,
    ...companies,
    ...companies,
  ];

  return (
    <div
      ref={containerRef}
      className={`w-full py-8 block transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      data-component="scrolling-banner"
      data-version="2024-11-13-polished"
    >
      <div className="container mx-auto px-6">
        {/* Title */}
        <h3 className="text-center text-sm font-light text-slate-600 mb-6 tracking-wide">
          Join candidates who turned practice into offers at
        </h3>
      </div>

      {/* Scrolling Container with Mask - Full width on mobile */}
      <div className="relative px-3 md:px-0 overflow-hidden">
        {/* Scrolling wrapper with gradient mask for smooth fade */}
        <div
          className={`flex items-center gap-3 md:gap-4 scroll-mask ${
            prefersReducedMotion ? '' : 'animate-scroll-pills'
          } hover:pause-animation`}
          style={{
            width: 'fit-content',
            display: 'flex',
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

      <style jsx>{`
        /* Seamless infinite scroll animation - moves exactly 50% for perfect loop */
        @keyframes scrollPills {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-pills {
          animation: scrollPills 60s linear infinite;
          will-change: transform;
        }

        /* Pause animation on hover for user inspection */
        .pause-animation:hover {
          animation-play-state: paused;
        }

        /* Gradient mask for elegant edge fades */
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
              black 80px,
              black calc(100% - 80px),
              transparent 100%
            );
            mask-image: linear-gradient(
              to right,
              transparent 0%,
              black 80px,
              black calc(100% - 80px),
              transparent 100%
            );
          }
        }

        /* Respect user motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-pills {
            animation: none;
          }
        }

        /* Optimize rendering performance */
        .animate-scroll-pills {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
