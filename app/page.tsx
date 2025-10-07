import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-server';

export default async function Home() {
  // Test server client connection
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">InterviewLab</h1>
        <p className="text-lg text-muted-foreground">
          AI-driven interview simulation platform
        </p>
        <Button>Get Started</Button>
        {/* Temporary connection test */}
        <p className="text-xs text-muted-foreground">
          {user ? `Logged in as: ${user.email}` : 'Not logged in'}
        </p>
      </div>
    </main>
  );
}
