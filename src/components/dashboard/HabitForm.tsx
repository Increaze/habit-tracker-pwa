'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

type FormSubmitEvent = Parameters<NonNullable<ComponentPropsWithoutRef<'form'>['onSubmit']>>[0];

type HabitFormValues = {
  name: string;
  description: string;
  frequency: 'daily';
};

type HabitFormProps = {
  initialHabit?: Habit | null;
  onSave: (values: HabitFormValues) => void;
  onCancel?: () => void;
};

export function HabitForm({ initialHabit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initialHabit?.name ?? '');
  const [description, setDescription] = useState(initialHabit?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialHabit?.name ?? '');
    setDescription(initialHabit?.description ?? '');
    setError(null);
  }, [initialHabit]);

  const handleSubmit = (event: FormSubmitEvent) => {
    event.preventDefault();
    const validation = validateHabitName(name);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    onSave({
      name: validation.value,
      description: description.trim(),
      frequency: 'daily',
    });
  };

  return (
    <form
      data-testid="habit-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[1.75rem] border border-(--border) bg-(--card) p-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="habit-name-input">
          Habit name
        </label>
        <input
          id="habit-name-input"
          data-testid="habit-name-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-(--border) bg-white px-4 py-3 font-medium"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="habit-description-input">
          Description
        </label>
        <textarea
          id="habit-description-input"
          data-testid="habit-description-input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="font-body min-h-24 w-full rounded-xl border border-(--border) bg-white px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="habit-frequency-select">
          Frequency
        </label>
        <select
          id="habit-frequency-select"
          data-testid="habit-frequency-select"
          value="daily"
          disabled
          className="w-full rounded-xl border border-(--border) bg-white px-4 py-3 font-medium"
        >
          <option value="daily">Daily</option>
        </select>
      </div>
      {error ? (
        <p className="font-body rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <button
          data-testid="habit-save-button"
          type="submit"
          className="flex-1 rounded-xl bg-(--accent) px-4 py-3 font-medium text-white"
        >
          Save habit
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-(--border) px-4 py-3"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
