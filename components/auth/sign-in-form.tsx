'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      setSession(sessionData?.session ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Sending sign-in link...');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`
      }
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
      return;
    }

    setStatus('Check your email for the login link.');
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatus(`Error signing out: ${error.message}`);
      return;
    }
    setStatus('Signed out successfully.');
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Supabase auth flow</CardTitle>
        <CardDescription>
          Sign in with a magic link, then visit your profile page to confirm the session.
        </CardDescription>
      </CardHeader>

      {session ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-200">
            Signed in as <span className="font-semibold text-cyan-300">{session.user.email}</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSignOut}>Sign out</Button>
            <a className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800" href="/profile">
              View profile
            </a>
          </div>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <Button type="submit">Send magic link</Button>
          {status ? <p className="text-sm text-slate-300">{status}</p> : null}
        </form>
      )}
    </Card>
  );
}
