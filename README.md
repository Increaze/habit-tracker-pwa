# Habit Tracker PWA

## Project Overview

This project is a mobile-first Habit Tracker Progressive Web App built with Next.js App Router, React, TypeScript, Tailwind CSS, and localStorage. It supports local signup, login, logout, habit creation, editing, deletion, daily completion toggling, visible streak tracking, session persistence, and basic offline-capable PWA behavior.

## Setup Instructions

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.

## Run Instructions

- Development: `npm run dev`
- Production build: `npm run build`
- Production server: `npm run start`

## Test Instructions

- Unit tests with coverage: `npm run test:unit`
- Integration tests: `npm run test:integration`
- End-to-end tests: `npm run test:e2e`
- Full suite: `npm run test`

## Local Persistence Structure

The app uses localStorage only.

- `habit-tracker-users`: JSON array of users with `id`, `email`, `password`, and `createdAt`
- `habit-tracker-session`: `null` or the active session with `userId` and `email`
- `habit-tracker-habits`: JSON array of habits with `id`, `userId`, `name`, `description`, `frequency`, `createdAt`, and `completions`

Each habit belongs to a single local user and habit lists on the dashboard are filtered by the active session user.

## PWA Support

PWA support is implemented with:

- `public/manifest.json` for install metadata
- `public/sw.js` for service worker caching
- client-side service worker registration in `src/components/shared/ServiceWorkerRegistration.tsx`

The service worker caches the app shell and serves cached navigation responses or a cached fallback when offline, which allows the app shell to load again after it has been visited once.

## Trade-offs And Limitations

- Authentication is local only and stores plain-text passwords because the stage requires deterministic local persistence and no backend service.
- Route protection is client-side because session state exists only in localStorage.
- Offline support is intentionally minimal and focused on caching the shell rather than syncing data.
- Habit frequency is fixed to `daily` for this stage as required.

## Required Test File Mapping

- `tests/unit/slug.test.ts`: verifies slug generation behavior
- `tests/unit/validators.test.ts`: verifies habit name validation rules
- `tests/unit/streaks.test.ts`: verifies current streak calculation rules
- `tests/unit/habits.test.ts`: verifies habit completion toggling behavior
- `tests/integration/auth-flow.test.tsx`: verifies signup and login form flows and session storage behavior
- `tests/integration/habit-form.test.tsx`: verifies habit CRUD and streak updates through the dashboard UI
- `tests/e2e/app.spec.ts`: verifies route redirects, authenticated behavior, persistence, logout, and offline shell loading in the running app
# habit-tracker-pwa
