'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { getSubjectsByBoardAndGrade } from '@/lib/subjects-seed';
import { AppLogo } from '@/components/ui/app-logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const roleMap: Record<string, string> = {
  Student: 'STUDENT',
  Parent: 'STUDENT',
  Teacher: 'INSTRUCTOR',
};

const GRADES = [
  { value: 'Grade 1', label: 'Grade 1' },
  { value: 'Grade 2', label: 'Grade 2' },
  { value: 'Grade 3', label: 'Grade 3' },
  { value: 'Grade 4', label: 'Grade 4' },
  { value: 'Grade 5', label: 'Grade 5' },
  { value: 'Grade 6', label: 'Grade 6' },
  { value: 'Grade 7', label: 'Grade 7' },
  { value: 'Grade 8', label: 'Grade 8' },
  { value: 'Grade 9', label: 'Grade 9' },
  { value: 'Grade 10', label: 'Grade 10' },
  { value: 'Grade 11', label: 'Grade 11' },
  { value: 'Grade 12', label: 'Grade 12' },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('Grade 9');
  const [board, setBoard] = useState('CBSE');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [termsChecked, setTermsChecked] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const labelClassName = 'text-sm font-medium text-gray-900 dark:text-slate-100';
  const fieldClassName = 'w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500';

  // Update available subjects when grade or board changes
  useEffect(() => {
    const gradeNum = parseInt(grade.replace('Grade ', ''), 10);
    const boardMap: Record<string, string> = {
      'CBSE': 'CBSE',
      'ICSE': 'ICSE',
      'State Board': 'STATE_BOARD',
    };
    const subjects = getSubjectsByBoardAndGrade(boardMap[board] || 'CBSE', gradeNum);
    setAvailableSubjects(subjects);
    setSelectedSubjects([]); // Reset selection when board/grade changes
  }, [grade, board]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

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

    if (role === 'Student' && !parentEmail.trim()) {
      setStatus({ type: 'error', message: 'Please provide a parent email for student accounts.' });
      return;
    }

    if (selectedSubjects.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one subject.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const gradeNum = parseInt(grade.replace('Grade ', ''), 10);
      const boardMap: Record<string, string> = {
        'CBSE': 'CBSE',
        'ICSE': 'ICSE',
        'State Board': 'STATE_BOARD',
      };

      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          parentEmail: role === 'Student' ? parentEmail.trim() : undefined,
          password,
          role: roleMap[role] ?? 'STUDENT',
          phone,
          grade: gradeNum,
          board: boardMap[board] || 'CBSE',
          subjects: selectedSubjects,
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-10 xl:grid-cols-[0.85fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900 p-10 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40">
          <AppLogo
            size={56}
            className="mb-6 rounded-2xl border border-slate-100 p-1"
            priority
          />
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-600">Create or access your account</p>
          <h1 className="mt-6 text-4xl font-semibold text-slate-900 dark:text-slate-100">Welcome to School Assistant</h1>
          <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Choose whether you’re a student, parent, or teacher so we can personalize your learning pathways and classroom tools.</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {['Student', 'Parent', 'Teacher'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-3xl border px-5 py-5 text-left text-sm transition ${role === option ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <p className="font-semibold">{option}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Personalized setup and progress options.</p>
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-8">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Easy sign up</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Register with email and set up your profile in minutes.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-8">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Secure onboarding</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Your data is protected and only used to personalize learning suggestions.</p>
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
                <Label htmlFor="name" className={labelClassName}>Full Name</Label>
                <Input id="name" className={fieldClassName} value={name} onChange={(event) => setName(event.target.value)} placeholder="First and last name" />
              </div>
              <div>
                <Label htmlFor="role" className={labelClassName}>Role</Label>
                <Select id="role" className={fieldClassName} value={role} onChange={(event) => setRole(event.target.value)}>
                  <option>Student</option>
                  <option>Parent</option>
                  <option>Teacher</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email" className={labelClassName}>Email Address</Label>
                <Input id="email" className={fieldClassName} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.edu" />
                <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">We will use this email for login and account notifications.</p>
              </div>
              <div>
                <Label htmlFor="phone" className={labelClassName}>Phone Number</Label>
                <Input id="phone" className={fieldClassName} type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +91 98765 43210" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="parentEmail" className={labelClassName}>Parent Email</Label>
                <Input
                  id="parentEmail"
                  className={fieldClassName}
                  type="email"
                  value={parentEmail}
                  onChange={(event) => setParentEmail(event.target.value)}
                  placeholder="parent@example.com"
                />
                <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">Required for student accounts so teachers can contact parents.</p>
              </div>
              <div />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="password" className={labelClassName}>Password</Label>
                <Input id="password" className={fieldClassName} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" />
              </div>
              <div>
                <Label htmlFor="grade" className={labelClassName}>Grade Level</Label>
                <Select id="grade" className={fieldClassName} value={grade} onChange={(event) => setGrade(event.target.value)} required aria-required="true">
                  {GRADES.map((gradeOption) => (
                    <option key={gradeOption.value} value={gradeOption.value}>{gradeOption.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="board" className={labelClassName}>Education Board</Label>
                <Select id="board" className={fieldClassName} value={board} onChange={(event) => setBoard(event.target.value)}>
                  <option>CBSE</option>
                  <option>ICSE</option>
                  <option>State Board</option>
                </Select>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-4">
                <input id="terms" type="checkbox" className="h-4 w-4 accent-cyan-600" checked={termsChecked} onChange={(event) => setTermsChecked(event.target.checked)} />
                <label htmlFor="terms" className="text-sm text-gray-900 dark:text-slate-100">I agree to the Terms of Use and Privacy Policy.</label>
              </div>
            </div>

            {/* Subjects Selection */}
            <div>
              <Label className={`mb-3 block ${labelClassName}`}>Select Your Subjects</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                        selectedSubjects.includes(subject)
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <span className={`mr-2 ${selectedSubjects.includes(subject) ? '✓' : '○'}`}></span>
                      {subject}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-slate-400">Select grade and board to see available subjects</p>
                )}
              </div>
              {selectedSubjects.length > 0 && (
                <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">
                  Selected: {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {status ? (
              <div role="alert" className={`rounded-2xl border p-4 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-600'}`}>
                {status.message}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-slate-950 dark:bg-cyan-600 px-6 py-4 text-sm text-white hover:bg-slate-800 dark:hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span>Or sign up using</span>
            <div className="flex gap-3">
              {['Google', 'Microsoft', 'Apple'].map((provider) => (
                <Button key={provider} type="button" className="rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800">{provider}</Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
