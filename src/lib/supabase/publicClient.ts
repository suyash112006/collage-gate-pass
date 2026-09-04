// src/lib/supabase/publicClient.ts
// Public (unauthenticated) Supabase client used for realtime subscriptions that must survive
// after a student session is revoked (e.g., during BLOCK/UNBLOCK flows).

import { createClient } from '@supabase/supabase-js'

export const createPublicClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // No auth cookies are attached – this client connects as an anonymous user.
  return createClient(supabaseUrl, supabaseAnonKey)
}
