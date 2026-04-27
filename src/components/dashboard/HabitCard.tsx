'use client';

import { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';

type HabitCardProps = {
  habit: Habit;
  streak: number;
  completedToday: boolean;
  onToggleComplete: (habitId: string) => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
};

export function HabitCard({
  habit,
  streak,
  completedToday,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const slug = getHabitSlug(habit.name);

  return (
    <article
      data-testid={`habit-card-${slug}`}
      className={`rounded-[1.75rem] border p-5 shadow-sm shadow-black/5 transition ${
        completedToday
          ? 'border-(--accent) bg-teal-50'
          : 'border-(--border) bg-(--card)'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">{habit.name}</h2>
          <p className="font-body mt-2 text-sm text-(--muted)">
            {habit.description || 'No description added yet.'}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-(--accent-secondary)">
          {habit.frequency}
        </span>
      </div>
      <p data-testid={`habit-streak-${slug}`} className="mt-4 text-sm font-medium">
        Current streak: {streak}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          data-testid={`habit-complete-${slug}`}
          type="button"
          onClick={() => onToggleComplete(habit.id)}
          className={`rounded-xl px-4 py-3 font-semibold ${
            completedToday
              ? 'bg-(--accent-secondary) text-white'
              : 'border border-(--border) bg-white'
          }`}
        >
          {completedToday ? 'Completed today' : 'Mark complete'}
        </button>
        <button
          data-testid={`habit-edit-${slug}`}
          type="button"
          onClick={() => onEdit(habit.id)}
          className="rounded-xl border border-(--border) px-4 py-3"
        >
          Edit
        </button>
        <button
          data-testid={`habit-delete-${slug}`}
          type="button"
          onClick={() => onDelete(habit.id)}
          className="rounded-xl border border-red-200 px-4 py-3 text-(--danger)"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
