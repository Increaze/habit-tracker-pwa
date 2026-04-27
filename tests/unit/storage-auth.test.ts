import { getTodayDate } from '@/lib/date';
import { loginUser, logoutUser, signupUser } from '@/lib/auth';
import {
  clearSession,
  getHabits,
  getSession,
  getUsers,
  saveHabits,
  saveSession,
  saveUsers,
} from '@/lib/storage';
import { describe, beforeEach, vi, afterEach, it, expect } from 'vitest';

describe('local auth and storage helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T10:00:00.000Z'));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores users, habits, and sessions in localStorage', () => {
    saveUsers([{ id: 'user-1', email: 'member@example.com', password: 'password123', createdAt: '2026-04-25T00:00:00.000Z' }]);
    saveHabits([
      {
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: '2026-04-25T00:00:00.000Z',
        completions: [],
      },
    ]);
    saveSession({ userId: 'user-1', email: 'member@example.com' });

    expect(getUsers()).toHaveLength(1);
    expect(getHabits()).toHaveLength(1);
    expect(getSession()).toEqual({ userId: 'user-1', email: 'member@example.com' });
  });

  it('supports signup, login, logout, and duplicate protection', () => {
    expect(signupUser('member@example.com', 'password123').error).toBeUndefined();
    expect(signupUser('member@example.com', 'password123').error).toBe('User already exists');

    clearSession();
    expect(loginUser('member@example.com', 'wrong-password').error).toBe('Invalid email or password');
    expect(loginUser('member@example.com', 'password123').session).toEqual({
      userId: getUsers()[0].id,
      email: 'member@example.com',
    });

    logoutUser();
    expect(getSession()).toBeNull();
  });

  it('returns today in YYYY-MM-DD format', () => {
    expect(getTodayDate()).toBe('2026-04-25');
  });
});
