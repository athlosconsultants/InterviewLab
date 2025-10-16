import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (!document.cookie) return [];
          return document.cookie
            .split(';')
            .map((cookie) => {
              const trimmed = cookie.trim();
              if (!trimmed) return null;
              const [name, ...rest] = trimmed.split('=');
              return { name, value: rest.join('=') };
            })
            .filter(Boolean) as { name: string; value: string }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Build cookie string
            let cookie = `${name}=${value}`;
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
            if (options?.path) cookie += `; path=${options.path || '/'}`;

            // For HTTPS (including production), use Secure and SameSite=None
            // This is critical for in-app browsers like TikTok
            if (window.location.protocol === 'https:') {
              cookie += '; secure; samesite=none';
            } else {
              // For local development on HTTP
              cookie += '; samesite=lax';
            }

            document.cookie = cookie;
            console.log(
              '🍪 Setting cookie:',
              name,
              '(protocol:',
              window.location.protocol + ')'
            );
          });
        },
      },
    }
  );
}
