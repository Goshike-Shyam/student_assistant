'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      setSession(sessionData?.session ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatus(`Error signing out: ${error.message}`);
      return;
    }
    setStatus('Signed out successfully.');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Student profile and progress</h1>
              <p className="mt-4 text-slate-600">View your active session, progress metrics, and account security details.</p>
            </div>
            <div className="space-y-3 sm:flex sm:items-center sm:gap-3">
              <Button className="rounded-full bg-slate-950 px-6 py-3 text-sm text-white hover:bg-slate-800">Edit profile</Button>
              <Button onClick={handleSignOut} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm text-slate-900 hover:bg-slate-50">Sign out</Button>
            </div>
          </div>
        </section>

        {session ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="space-y-6 p-8">
              <div className="flex items-center gap-5">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-950">{session.user.email}</p>
                  <p className="mt-1 text-sm text-slate-500">Student • Grade 9</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Study streak</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">16 days</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Total XP</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">1,240</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Badges</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">9</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Achievements</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="success">Homework Hero</Badge>
                    <Badge variant="neutral">Streak Star</Badge>
                    <Badge variant="warning">Growth Hero</Badge>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Subscription</p>
                  <p className="mt-3 text-base font-semibold text-slate-900">Student Premium</p>
                  <p className="mt-2 text-sm text-slate-600">Renews June 12, 2026</p>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-8">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Account protection and device access.</CardDescription>
                </CardHeader>
                <div className="mt-6 space-y-4 text-slate-700">
                  <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">Email verified</p>
                      <p className="text-sm text-slate-500">Connected to your school account.</p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Connected devices</p>
                    <p className="mt-1 text-sm text-slate-500">Chrome on macOS, iPad app, Chrome on Windows</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <CardHeader>
                  <CardTitle>Learning summary</CardTitle>
                  <CardDescription>Recent activity and progress.</CardDescription>
                </CardHeader>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Recent activity</p>
                    <p className="mt-2 text-sm text-slate-700">Completed Algebra quiz, reviewed Biology notes, uploaded history draft.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Focus areas</p>
                    <p className="mt-2 text-sm text-slate-700">Algebra, Chemistry, English comprehension.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle>No active session</CardTitle>
              <CardDescription>Please sign in first using the login page.</CardDescription>
            </CardHeader>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-full bg-slate-950 px-6 py-3 text-sm text-white hover:bg-slate-800">Login</Button>
              {status ? <p className="text-sm text-slate-600">{status}</p> : null}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
