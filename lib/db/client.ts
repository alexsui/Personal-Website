import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _publicClient: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

// Public client — used for reads (respects RLS)
export function getPublicClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _publicClient;
}

// Admin client — bypasses RLS. Authenticate before reads or writes on behalf of a user.
// Only call server-side — never import this in client components
export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) } }
    );
  }
  return _adminClient;
}
