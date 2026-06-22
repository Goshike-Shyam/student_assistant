'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const roleMap: Record<string, string> = {
  Student: 'STUDENT',
  Parent: 'STUDENT',
  Teacher: 'INSTRUCTOR',
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('Grade 9');
  const [board, setBoard] = useState('CBSE');
  const [termsChecked, setTermsChecked] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!termsChecked) {
      setStatus({ type: 'error', message: 'You must agree to the Terms of Use and Privacy Policy.' });
      return;
    }

    if (!name || !email || !password) {
      setStatus({ type: 'error', message: 'Please provide your name, email, and password.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: roleMap[role] ?? 'STUDENT',
          phone,
          grade,
          board,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || 'Signup request failed.');
      }

      setStatus({ type: 'success', message: 'Account created successfully. Redirecting to login...' });
      
      // Redirect to login page after 1.5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Signup failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-10 xl:grid-cols-[0.85fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-10 shadow-xl shadow-slate-200/40">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Create or access your account</p>
          <h1 className="mt-6 text-4xl font-semibold text-slate-900">Welcome to School Assistant</h1>
          <p className="mt-4 max-w-2xl text-slate-600">Choose whether you’re a student, parent, or teacher so we can personalize your learning pathways and classroom tools.</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {['Student', 'Parent', 'Teacher'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-3xl border px-5 py-5 text-left text-sm transition ${role === option ? 'border-cyan-600 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <p className="font-semibold">{option}</p>
                <p className="mt-2 text-sm text-slate-500">Personalized setup and progress options.</p>
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm font-semibold text-slate-900">Easy sign up</p>
              <p className="mt-3 text-sm text-slate-600">Register with email and set up your profile in minutes.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm font-semibold text-slate-900">Secure onboarding</p>
              <p className="mt-3 text-sm text-slate-600">Your data is protected and only used to personalize learning suggestions.</p>
            </div>
          </div>
        </section>

        <Card className="space-y-6 p-10">
          <CardHeader>
            <CardTitle>Create your School Assistant account</CardTitle>
            <CardDescription>Sign up securely using email or phone OTP.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="First and last name" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
                  <option>Student</option>
                  <option>Parent</option>
                  <option>Teacher</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.edu" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +91 98765 43210" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Select id="grade" value={grade} onChange={(event) => setGrade(event.target.value)}>
                  <option>Grade 6</option>
                  <option>Grade 7</option>
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="board">Education Board</Label>
                <Select id="board" value={board} onChange={(event) => setBoard(event.target.value)}>
                  <option>CBSE</option>
                  <option>ICSE</option>
                  <option>State Board</option>
                </Select>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input id="terms" type="checkbox" className="h-4 w-4 accent-cyan-600" checked={termsChecked} onChange={(event) => setTermsChecked(event.target.checked)} />
                <label htmlFor="terms" className="text-sm text-slate-700">I agree to the Terms of Use and Privacy Policy.</label>
              </div>
            </div>

            {status ? (
              <div className={`rounded-2xl p-4 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {status.message}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>Or sign up using</span>
            <div className="flex gap-3">
              {['Google', 'Microsoft', 'Apple'].map((provider) => (
                <Button key={provider} type="button" className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50">{provider}</Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
