import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">
            The magic link has expired or is invalid.
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Magic links expire after a few minutes for security reasons.</p>
          <p>Please request a new link to sign in.</p>
        </div>

        <Button asChild className="w-full">
          <Link href="/sign-in">Request New Magic Link</Link>
        </Button>
      </div>
    </main>
  );
}
