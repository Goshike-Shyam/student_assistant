'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/app-logo';

interface User {
  id?: string;
  email?: string;
  name?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [session, setSession] = useState<User | null>(null);
  
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Signing in...');

    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || 'Sign in failed. Please check your credentials.');
      }

      const data = await response.json();
      
      // Store user information in localStorage for the site-header and other components
      localStorage.setItem('userId', data.user?.id || '');
      localStorage.setItem('userName', data.user?.name || 'User');
      localStorage.setItem('userGrade', data.user?.grade ? String(data.user.grade) : '9');
      localStorage.setItem('userBoard', data.user?.curriculum || 'CBSE');
      localStorage.setItem('userRole', data.user?.role ? (data.user.role === 'STUDENT' ? 'Student' : data.user.role === 'INSTRUCTOR' ? 'Teacher' : 'Admin') : 'Student');
      
      // Redirect to dashboard immediately
      window.location.href = '/dashboard';
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    // Clear all user data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userGrade');
    localStorage.removeItem('userRole');
    
    setSession(null);
    setStatus('Signed out successfully.');
    setEmail('');
    setPassword('');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <AppLogo
          size={32}
          className="rounded-xl"
          priority
        />
        <span className="qs font-bold text-xl text-[#006e2f]">Student Assistant</span>
      </div>

      <div className="mb-8">
        <h1 className="qs font-bold text-[38px] text-[#0b1c30] leading-tight mb-2">Welcome Back</h1>
        <p className="text-[#6d7b6c] text-base">Sign in to your account to access your learning dashboard.</p>
      </div>

      {session ? (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#eff4ff] border border-[#d8e2ff] p-5">
            <p className="text-sm text-[#0b1c30]">
              Signed in as <span className="font-semibold text-[#0058be]">{session?.email ?? "Not signed in"}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSignOut}
              className="btn-3d-green px-6 py-3.5 bg-[#006e2f] text-white qs font-bold rounded-xl hover:bg-[#005828] transition-colors flex items-center justify-center text-sm"
            >
              Sign out
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 border-2 border-[#bccbb9] text-[#0b1c30] qs font-bold rounded-xl hover:bg-[#f8f9ff] transition-all text-center text-sm"
            >
              View dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="signin-email" className="block text-sm font-semibold text-[#0b1c30] mb-2.5">Email address</label>
            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border-2 border-[#bccbb9] rounded-xl text-[#0b1c30] placeholder-[#4B5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors font-base"
            />
          </div>

          <div>
            <label htmlFor="signin-password" className="block text-sm font-semibold text-[#0b1c30] mb-2.5">Password</label>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-[#bccbb9] rounded-xl text-[#0b1c30] placeholder-[#4B5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors font-base"
            />
          </div>

          <button
            type="submit"
            className="btn-3d-green w-full mt-8 px-6 py-3.5 bg-[#006e2f] text-white qs font-bold rounded-xl hover:bg-[#005828] transition-colors flex items-center justify-center gap-2 text-base"
          >
            Continue <span className="mat text-xl">arrow_forward</span>
          </button>

          {status ? (
            <p role="alert" className={`text-sm text-center ${status.includes('successful') ? 'text-[#006e2f]' : 'text-[#ba1a1a]'}`}>
              {status}
            </p>
          ) : null}

          <div className="pt-4 border-t border-[#e5eeff]">
            <p className="text-sm text-[#6d7b6c]">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#0058be] hover:text-[#003da8]">
                Create one
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
