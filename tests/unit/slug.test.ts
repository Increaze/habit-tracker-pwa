import { getHabitSlug } from '@/lib/slug';
import { describe, it, expect } from 'vitest';

describe('getHabitSlug', () => {
  it('returns lowercase hyphenated slug for a basic habit name', () => {
    expect(getHabitSlug('Drink Water')).toBe('drink-water');
  });

  it('trims outer spaces and collapses repeated internal spaces', () => {
    expect(getHabitSlug('  Read   Books  ')).toBe('read-books');
  });

  it('removes non alphanumeric characters except hyphens', () => {
    expect(getHabitSlug('Morning! Stretch & Flow')).toBe('morning-stretch-flow');
  });
});
