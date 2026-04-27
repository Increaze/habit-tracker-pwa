function toDateValue(date: string): number {
  return new Date(`${date}T00:00:00Z`).getTime();
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function calculateCurrentStreak(
  completions: string[],
  today = new Date().toISOString().slice(0, 10),
): number {
  const uniqueDates = [...new Set(completions)].sort();

  if (!uniqueDates.includes(today)) {
    return 0;
  }

  const completionSet = new Set(uniqueDates);
  let streak = 0;
  let cursor = new Date(`${today}T00:00:00Z`);

  while (completionSet.has(formatDate(cursor))) {
    streak += 1;
    cursor = new Date(toDateValue(formatDate(cursor)) - 86400000);
  }

  return streak;
}
