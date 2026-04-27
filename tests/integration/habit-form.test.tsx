import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import {
  HABITS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
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

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
    pushMock.mockReset();
    replaceMock.mockReset();

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        userId: 'user-1',
        email: 'member@example.com',
      }),
    );
  });

  async function renderDashboard() {
    const user = userEvent.setup();
    render(<DashboardClient />);
    await screen.findByTestId('dashboard-page');
    return user;
  }

  it('shows a validation error when habit name is empty', async () => {
    const user = await renderDashboard();

    await user.click(screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByText('Habit name is required')).toBeInTheDocument();
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = await renderDashboard();

    await user.click(screen.getByTestId('create-habit-button'));
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Finish two bottles');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByTestId('habit-card-drink-water')).toBeInTheDocument();

    const storedHabits = JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) ?? '[]');
    expect(storedHabits).toHaveLength(1);
    expect(storedHabits[0]).toMatchObject({
      userId: 'user-1',
      name: 'Drink Water',
      description: 'Finish two bottles',
      frequency: 'daily',
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    localStorage.setItem(
      HABITS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: 'Old description',
          frequency: 'daily',
          createdAt: '2026-04-20T00:00:00.000Z',
          completions: ['2026-04-25'],
        },
      ]),
    );

    const user = await renderDashboard();

    await user.click(screen.getByTestId('habit-edit-drink-water'));
    await user.clear(screen.getByTestId('habit-name-input'));
    await user.type(screen.getByTestId('habit-name-input'), 'Drink More Water');
    await user.clear(screen.getByTestId('habit-description-input'));
    await user.type(screen.getByTestId('habit-description-input'), 'Updated description');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByTestId('habit-card-drink-more-water')).toBeInTheDocument();

    const storedHabits = JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) ?? '[]');
    expect(storedHabits[0]).toMatchObject({
      id: 'habit-1',
      userId: 'user-1',
      createdAt: '2026-04-20T00:00:00.000Z',
      completions: ['2026-04-25'],
      name: 'Drink More Water',
      description: 'Updated description',
      frequency: 'daily',
    });
  });

  it('deletes a habit only after explicit confirmation', async () => {
    localStorage.setItem(
      HABITS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: '',
          frequency: 'daily',
          createdAt: '2026-04-20T00:00:00.000Z',
          completions: [],
        },
      ]),
    );

    const user = await renderDashboard();

    await user.click(screen.getByTestId('habit-delete-drink-water'));

    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('habit-card-drink-water')).not.toBeInTheDocument();
    });
  });

  it('toggles completion and updates the streak display', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    localStorage.setItem(
      HABITS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: '',
          frequency: 'daily',
          createdAt: '2026-04-20T00:00:00.000Z',
          completions: [yesterday],
        },
      ]),
    );

    const user = await renderDashboard();
    const card = screen.getByTestId('habit-card-drink-water');

    expect(within(card).getByText('Mark complete')).toBeInTheDocument();
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('Current streak: 0');

    await user.click(screen.getByTestId('habit-complete-drink-water'));

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('Current streak: 2');
    expect(within(screen.getByTestId('habit-card-drink-water')).getByText('Completed today')).toBeInTheDocument();
  });
});
