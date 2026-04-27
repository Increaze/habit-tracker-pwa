'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/lib/auth';
import { AuthCard } from '@/components/auth/AuthCard';

type FormSubmitEvent = Parameters<NonNullable<ComponentPropsWithoutRef<'form'>['onSubmit']>>[0];

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormSubmitEvent) => {
    event.preventDefault();
    const result = signupUser(email, password);

    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);
    router.push('/dashboard');
  };

  return (
    <AuthCard title="Sign Up" subtitle="Create a local account to track your daily habits.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            data-testid="auth-signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            data-testid="auth-signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3"
            required
          />
        </div>
        {error ? (
          <p className="font-body rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          data-testid="auth-signup-submit"
          type="submit"
          className="w-full rounded-xl bg-[color:var(--accent)] px-4 py-3 font-medium text-white transition hover:bg-[color:var(--accent-strong)]"
        >
          Create account
        </button>
      </form>
      <p className="font-body mt-4 text-sm text-[color:var(--muted)]">
        Already have an account?{' '}
        <Link className="font-medium text-[color:var(--accent-secondary)]" href="/login">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
