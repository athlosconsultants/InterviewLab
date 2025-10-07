export const metadata = {
  title: 'InterviewLab',
  description: 'AI-driven interview simulation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

