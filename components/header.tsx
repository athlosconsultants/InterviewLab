import { createClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/app/actions/auth';
import { EntitlementBadge } from './EntitlementBadge';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-2">
        <Link href="/" className="flex items-center gap-2 min-w-0 flex-shrink">
          <Image
            src="/logo.png"
            alt="InterviewLab Logo"
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0"
          />
          <span className="text-xl font-bold truncate">InterviewLab</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {user ? (
            <>
              {/* T139: Show entitlement counter for logged-in users */}
              <EntitlementBadge />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
