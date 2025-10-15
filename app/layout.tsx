import './globals.css';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'InterviewLab',
  description: 'AI-driven interview simulation platform',
  icons: {
    icon: '/logo.png',
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
      </body>
    </html>
  );
}
