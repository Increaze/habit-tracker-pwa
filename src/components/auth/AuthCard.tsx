import type { ReactNode } from 'react';

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="w-full rounded-4xl border border-(--border) bg-(--card) p-6 shadow-lg shadow-black/5">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-(--accent-secondary)">Habit Tracker</p>
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        <p className="font-body mt-2 text-sm text-(--muted)">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
