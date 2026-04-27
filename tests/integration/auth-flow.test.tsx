import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import {
  SESSION_STORAGE_KEY,
  USERS_STORAGE_KEY,
} from '@/lib/storage';
import { vi, describe, beforeEach, it, expect } from 'vitest';

const pushMock = vi.fn();
const replaceMock = vi.fn();
const router = {
  push: pushMock,
  replace: replaceMock,
};

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    pushMock.mockReset();
    replaceMock.mockReset();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'new@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });

    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) ?? '[]');
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null');

    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe('new@example.com');
    expect(session.email).toBe('new@example.com');
  });

  it('shows an error for duplicate signup email', async () => {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'dupe@example.com',
          password: 'password123',
          createdAt: '2026-04-25T00:00:00.000Z',
        },
      ]),
    );

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'dupe@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(await screen.findByText('User already exists')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'member@example.com',
          password: 'password123',
          createdAt: '2026-04-25T00:00:00.000Z',
        },
      ]),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'member@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'password123');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });

    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null');
    expect(session).toEqual({
      userId: 'user-1',
      email: 'member@example.com',
    });
  });

  it('shows an error for invalid login credentials', async () => {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'member@example.com',
          password: 'password123',
          createdAt: '2026-04-25T00:00:00.000Z',
        },
      ]),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'member@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrong-password');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
