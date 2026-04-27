export function SplashScreen() {
  return (
    <main
      data-testid="splash-screen"
      className="flex min-h-screen items-center justify-center px-6 text-center"
    >
      <div className="rounded-4xl border border-(--border) bg-(--card) px-10 py-12 shadow-lg shadow-black/5">
        <p className="text-sm uppercase tracking-[0.35em] text-(--accent-secondary)">Daily focus</p>
        <h1 className="mt-4 text-4xl font-bold">Habit Tracker</h1>
      </div>
    </main>
  );
}
