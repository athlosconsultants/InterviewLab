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
      <body>
        <Header />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
