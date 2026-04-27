import { toggleHabitCompletion } from '@/lib/habits';
import { Habit } from '@/types/habit';
import { describe, it, expect } from 'vitest';

const baseHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: '',
  frequency: 'daily',
  createdAt: '2026-04-25T00:00:00.000Z',
  completions: [],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    expect(toggleHabitCompletion(baseHabit, '2026-04-25').completions).toEqual(['2026-04-25']);
  });

  it('removes a completion date when the date already exists', () => {
    expect(
      toggleHabitCompletion({ ...baseHabit, completions: ['2026-04-25'] }, '2026-04-25').completions,
    ).toEqual([]);
  });

  it('does not mutate the original habit object', () => {
    const habit = { ...baseHabit, completions: ['2026-04-24'] };
    const result = toggleHabitCompletion(habit, '2026-04-25');

    expect(habit.completions).toEqual(['2026-04-24']);
    expect(result).not.toBe(habit);
  });

  it('does not return duplicate completion dates', () => {
    expect(
      toggleHabitCompletion(
        { ...baseHabit, completions: ['2026-04-25', '2026-04-25'] },
        '2026-04-24',
      ).completions,
    ).toEqual(['2026-04-24', '2026-04-25']);
  });
});
