/** Today's date in the viewer's own time zone, as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T12:00:00Z`);
  const end = Date.parse(`${to}T12:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

export function formatDate(iso: string, withYear = false): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' as const } : {}),
  });
}
