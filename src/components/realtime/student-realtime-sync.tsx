"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient } from '@/lib/supabase/publicClient';
import { createClient } from '@/lib/supabase/client';

export function StudentRealtimeSync() {
  const router = useRouter();
  const publicSupabase = createPublicClient();
  const authSupabase = createClient();

  const [studentId, setStudentId] = useState<string | null>(null);

  // Step 1: get authenticated user ID (may be revoked later)
  useEffect(() => {
    authSupabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        // Step 2: fetch the associated student record once while session is valid
        // Use the authenticated Supabase client to fetch the student's ID.
        // This ensures RLS policies that rely on the user token are honoured.
        authSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error && Object.keys(error).length > 0) {
              console.error('[StudentRealtime] error fetching student:', error);
              return;
            }
            // If Supabase returns an empty error object, treat it as no student record.
            if (!data?.id) {
              console.warn('[StudentRealtime] student record missing for user', user.id);
              return;
            }
            setStudentId(data.id as string);
          });
      }
    });
  }, [authSupabase]);

  // Step 3: subscribe to realtime events once we have the studentId
  useEffect(() => {
    if (!studentId) return;
    let channel: any;
    const setupSubscription = async () => {
      console.log('[StudentRealtime] setting up subscription for student', studentId);
      channel = publicSupabase
        .channel('student_portal_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gate_passes' },
          () => {
            console.log('[StudentRealtime] gate_passes update');
            router.refresh();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'students',
            filter: `id=eq.${studentId}`,
          },
          (payload) => {
            if (!payload?.new) {
              console.warn('[StudentRealtime] payload missing new data', payload);
              return;
            }
            console.log('[StudentRealtime] student status update', payload);
            const newStatus = (payload.new as any).status as string;
            const currentPath = window.location.pathname;
            if (newStatus === 'BLOCKED' && currentPath !== '/student/blocked') {
              console.log('[StudentRealtime] redirecting to /student/blocked');
              window.location.replace('/student/blocked');
            } else if (newStatus === 'APPROVED' && currentPath === '/student/blocked') {
              console.log('[StudentRealtime] redirecting to /student/login');
              window.location.replace('/student/login');
            } else if (newStatus === 'APPROVED' && currentPath === '/student/under-review') {
              console.log('[StudentRealtime] redirecting to /student/dashboard');
              window.location.replace('/student/dashboard');
            } else {
              router.refresh();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            console.log('[StudentRealtime] notifications update');
            router.refresh();
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('[StudentRealtime] subscription error:', err);
            setTimeout(setupSubscription, 3000);
          } else {
            console.log('[StudentRealtime] subscription status:', status);
          }
        });
    };
    setupSubscription();

    return () => {
      if (channel) publicSupabase.removeChannel(channel);
      console.log('[StudentRealtime] subscription removed');
    };
  }, [router, publicSupabase, studentId]);

  // Component renders nothing visible.
  return null;
}
