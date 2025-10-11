/** @type {import('next').NextConfig} */
const nextConfig = {
  // T141: Security Headers & CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy (restrict access to browser features)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
          },
          // XSS Protection (legacy, but doesn't hurt)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'framer-motion'],
  },
};

export default nextConfig;

