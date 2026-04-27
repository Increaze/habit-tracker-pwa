import { Session, User } from '@/types/auth';
import { Habit } from '@/types/habit';

export const USERS_STORAGE_KEY = 'habit-tracker-users';
export const SESSION_STORAGE_KEY = 'habit-tracker-session';
export const HABITS_STORAGE_KEY = 'habit-tracker-habits';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): User[] {
  return readJson<User[]>(USERS_STORAGE_KEY, []);
}

export function saveUsers(users: User[]) {
  writeJson(USERS_STORAGE_KEY, users);
}

export function getSession(): Session | null {
  return readJson<Session | null>(SESSION_STORAGE_KEY, null);
}

export function saveSession(session: Session | null) {
  writeJson(SESSION_STORAGE_KEY, session);
}

export function clearSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getHabits(): Habit[] {
  return readJson<Habit[]>(HABITS_STORAGE_KEY, []);
}

export function saveHabits(habits: Habit[]) {
  writeJson(HABITS_STORAGE_KEY, habits);
}
