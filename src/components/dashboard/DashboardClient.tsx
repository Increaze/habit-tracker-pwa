'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Habit } from '@/types/habit';
import { Session } from '@/types/auth';
import { logoutUser } from '@/lib/auth';
import { getTodayDate } from '@/lib/date';
import { toggleHabitCompletion } from '@/lib/habits';
import { calculateCurrentStreak } from '@/lib/streaks';
import { getHabits, getSession, saveHabits } from '@/lib/storage';
import { HabitForm } from '@/components/dashboard/HabitForm';
import { HabitCard } from '@/components/dashboard/HabitCard';

type HabitFormValues = {
  name: string;
  description: string;
  frequency: 'daily';
};

export function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);

  useEffect(() => {
    const activeSession = getSession();

    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
    setHabits(getHabits().filter((habit) => habit.userId === activeSession.userId));
    setLoading(false);
  }, [router]);

  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === editingHabitId) ?? null,
    [editingHabitId, habits],
  );

  function persistForUser(nextHabits: Habit[]) {
    const allHabits = getHabits();
    const otherUsersHabits = allHabits.filter((habit) => habit.userId !== session?.userId);
    const mergedHabits = [...otherUsersHabits, ...nextHabits];
    saveHabits(mergedHabits);
    setHabits(nextHabits);
  }

  function handleSave(values: HabitFormValues) {
    if (!session) {
      return;
    }

    if (editingHabit) {
      const nextHabits: Habit[] = habits.map((habit) =>
        habit.id === editingHabit.id
          ? {
              ...habit,
              name: values.name,
              description: values.description,
              frequency: 'daily',
            }
          : habit,
      );
      persistForUser(nextHabits);
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        userId: session.userId,
        name: values.name,
        description: values.description,
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      };
      persistForUser([...habits, newHabit]);
    }

    setEditingHabitId(null);
    setShowForm(false);
  }

  function handleToggleComplete(habitId: string) {
    const date = getTodayDate();
    const nextHabits = habits.map((habit) =>
      habit.id === habitId ? toggleHabitCompletion(habit, date) : habit,
    );
    persistForUser(nextHabits);
  }

  function handleDelete(habitId: string) {
    const nextHabits = habits.filter((habit) => habit.id !== habitId);
    persistForUser(nextHabits);
    setDeleteHabitId(null);
    if (editingHabitId === habitId) {
      setEditingHabitId(null);
      setShowForm(false);
    }
  }

  function handleLogout() {
    logoutUser();
    router.push('/login');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main data-testid="dashboard-page" className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="rounded-4xl border border-(--border) bg-(--card) p-6 shadow-lg shadow-black/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-(--accent-secondary)">Dashboard</p>
              <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>
              <p className="font-body mt-2 text-sm text-(--muted)">{session?.email}</p>
            </div>
            <button
              data-testid="auth-logout-button"
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-(--border) px-4 py-3"
            >
              Log out
            </button>
          </div>
        </header>

        <section className="mt-6">
          <button
            data-testid="create-habit-button"
            type="button"
            onClick={() => {
              setEditingHabitId(null);
              setShowForm((value) => !value);
            }}
            className="w-full rounded-3xl bg-(--accent) px-5 py-4 text-center font-medium text-white shadow-md shadow-[rgba(113,43,19,0.18)]"
          >
            {showForm ? 'Close habit form' : 'Create a new habit'}
          </button>
          {showForm ? (
            <div className="mt-4">
              <HabitForm
                initialHabit={editingHabit}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingHabitId(null);
                }}
              />
            </div>
          ) : null}
        </section>

        <section className="mt-6 space-y-4">
          {habits.length === 0 ? (
            <div
              data-testid="empty-state"
              className="font-body rounded-[1.75rem] border border-dashed border-(--border) bg-white/70 p-8 text-center text-(--muted)"
            >
              No habits yet. Create your first one to start a streak.
            </div>
          ) : null}

          {habits.map((habit) => {
            const today = getTodayDate();
            const completedToday = habit.completions.includes(today);

            return (
              <div key={habit.id}>
                <HabitCard
                  habit={habit}
                  streak={calculateCurrentStreak(habit.completions, today)}
                  completedToday={completedToday}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(habitId) => {
                    setEditingHabitId(habitId);
                    setShowForm(true);
                  }}
                  onDelete={setDeleteHabitId}
                />
                {deleteHabitId === habit.id ? (
                  <div className="mt-3 rounded-3xl border border-red-200 bg-red-50 p-4">
                    <p className="font-body text-sm text-(--danger)">
                      Confirm deletion. This habit will be removed immediately.
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        data-testid="confirm-delete-button"
                        type="button"
                        onClick={() => handleDelete(habit.id)}
                        className="rounded-xl bg-[#c63d2f] px-4 py-3 font-semibold text-white transition hover:bg-[#a73024]"
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteHabitId(null)}
                        className="rounded-xl border border-(--border) px-4 py-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
