/** Adds business days (Mon–Fri) to a date. */
function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

/** Order before 2pm for same-day dispatch. */
export function deliveryEstimate(now = new Date()) {
  const cutoffPassed = now.getHours() >= 14;
  return {
    standard: [addBusinessDays(now, cutoffPassed ? 3 : 2), addBusinessDays(now, cutoffPassed ? 5 : 4)] as const,
    express: addBusinessDays(now, cutoffPassed ? 2 : 1),
  };
}
