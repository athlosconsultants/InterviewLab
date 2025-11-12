import './globals.css';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'The Interview Lab — Realistic AI Mock Interviews for Job Seekers',
  description:
    'Prepare for your next job interview with realistic, AI-driven mock interviews built from real company frameworks. Free to try — instant feedback and voice modes available.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'The Interview Lab — Realistic AI Mock Interviews for Job Seekers',
    description:
      'Prepare for your next job interview with realistic, AI-driven mock interviews built from real company frameworks. Free to try — instant feedback and voice modes available.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical company logos for instant display */}
        <link rel="preload" href="/logos/goldman-sachs.svg" as="image" />
        <link rel="preload" href="/logos/mckinsey.png" as="image" />
        <link rel="preload" href="/logos/google.svg" as="image" />
        <link rel="preload" href="/logos/deloitte.svg" as="image" />
        <link rel="preload" href="/logos/hsbc.svg" as="image" />
        <link rel="preload" href="/logos/vodafone.svg" as="image" />
        <link rel="preload" href="/logos/turner-townsend.png" as="image" />
        <link rel="preload" href="/logos/bp.svg" as="image" />
        <link rel="preload" href="/logos/macquarie.svg" as="image" />
        <link rel="preload" href="/logos/arup.jpeg" as="image" />
        <link rel="preload" href="/logos/rio-tinto.svg" as="image" />
        <link rel="preload" href="/logos/atlassian.svg" as="image" />
      </head>
      <body>
        <Header />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
