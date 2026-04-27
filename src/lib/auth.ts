import { Session, User } from '@/types/auth';
import { clearSession, getUsers, saveSession, saveUsers } from '@/lib/storage';

function createId() {
  return crypto.randomUUID();
}

export function signupUser(email: string, password: string): { session?: Session; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { error: 'Email and password are required' };
  }

  const users = getUsers();
  const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    return { error: 'User already exists' };
  }

  const user: User = {
    id: createId(),
    email: normalizedEmail,
    password: trimmedPassword,
    createdAt: new Date().toISOString(),
  };

  const session: Session = {
    userId: user.id,
    email: user.email,
  };

  saveUsers([...users, user]);
  saveSession(session);

  return { session };
}

export function loginUser(email: string, password: string): { session?: Session; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  const user = getUsers().find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedEmail && candidate.password === trimmedPassword,
  );

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const session: Session = {
    userId: user.id,
    email: user.email,
  };

  saveSession(session);
  return { session };
}

export function logoutUser() {
  clearSession();
}
