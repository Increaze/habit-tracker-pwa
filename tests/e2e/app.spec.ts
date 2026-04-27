import { expect, test, type Page } from '@playwright/test';

const sessionKey = 'habit-tracker-session';
const usersKey = 'habit-tracker-users';
const habitsKey = 'habit-tracker-habits';

async function signup(page: Page, email = 'member@example.com') {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(email);
  await page.getByTestId('auth-signup-password').fill('password123');
  await page.getByTestId('auth-signup-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(
      ({ sessionKey: currentSessionKey, usersKey: currentUsersKey, habitsKey: currentHabitsKey }) => {
        localStorage.removeItem(currentSessionKey);
        localStorage.removeItem(currentUsersKey);
        localStorage.removeItem(currentHabitsKey);
      },
      { sessionKey, usersKey, habitsKey },
    );
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await signup(page);
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('new@example.com');
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    const session = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), sessionKey);
    expect(session.email).toBe('new@example.com');
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(
      ({ usersKey: currentUsersKey, habitsKey: currentHabitsKey }) => {
        localStorage.setItem(
          currentUsersKey,
          JSON.stringify([
            {
              id: 'user-1',
              email: 'member@example.com',
              password: 'password123',
              createdAt: '2026-04-20T00:00:00.000Z',
            },
            {
              id: 'user-2',
              email: 'other@example.com',
              password: 'password123',
              createdAt: '2026-04-21T00:00:00.000Z',
            },
          ]),
        );
        localStorage.setItem(
          currentHabitsKey,
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
            {
              id: 'habit-2',
              userId: 'user-2',
              name: 'Read Books',
              description: '',
              frequency: 'daily',
              createdAt: '2026-04-20T00:00:00.000Z',
              completions: [],
            },
          ]),
        );
      },
      { usersKey, habitsKey },
    );

    await page.getByTestId('auth-login-email').fill('member@example.com');
    await page.getByTestId('auth-login-password').fill('password123');
    await page.getByTestId('auth-login-submit').click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await expect(page.getByTestId('habit-card-read-books')).toHaveCount(0);
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await signup(page);

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Morning Walk');
    await page.getByTestId('habit-description-input').fill('Walk for twenty minutes');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-morning-walk')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await signup(page);
    await page.evaluate((key) => {
      const session = JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null');
      localStorage.setItem(
        key,
        JSON.stringify([
          {
            id: 'habit-1',
            userId: session.userId,
            name: 'Drink Water',
            description: '',
            frequency: 'daily',
            createdAt: '2026-04-20T00:00:00.000Z',
            completions: [new Date(Date.now() - 86400000).toISOString().slice(0, 10)],
          },
        ]),
      );
    }, habitsKey);

    await page.reload();
    await page.getByTestId('habit-complete-drink-water').click();

    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('2');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await signup(page);

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Meditate');
    await page.getByTestId('habit-save-button').click();
    await page.reload();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('habit-card-meditate')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await signup(page);
    await page.getByTestId('auth-logout-button').click();

    await expect(page).toHaveURL(/\/login$/);

    const session = await page.evaluate((key) => localStorage.getItem(key), sessionKey);
    expect(session).toBeNull();
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({
    page,
    context,
  }) => {
    await signup(page);
    await page.goto('/');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await page.waitForTimeout(1500);
    await context.setOffline(true);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/Habit Tracker|Offline/);

    await context.setOffline(false);
  });
});
