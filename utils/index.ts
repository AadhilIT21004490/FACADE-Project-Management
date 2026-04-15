/**
 * Format a date string or Date object for display
 */
export function formatDate(
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}

/**
 * Format a number as currency (USD by default)
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

/**
 * Calculate days remaining until a date (negative = overdue)
 */
export function daysUntil(date: string | Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns human-readable deadline label
 */
export function deadlineLabel(date: string | Date): string {
  const days = daysUntil(date);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `In ${days} days`;
}

/**
 * Calculate remaining balance
 */
export function calculateRemaining(totalValue: number, paidAmount: number): number {
  return Math.max(0, totalValue - paidAmount);
}

/**
 * Calculate payment completion percentage
 */
export function paymentProgress(totalValue: number, paidAmount: number): number {
  if (totalValue <= 0) return 0;
  return Math.min(100, Math.round((paidAmount / totalValue) * 100));
}

/**
 * Truncate a string to a given length
 */
export function truncate(str: string, maxLength: number = 60): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Convert a mongoose document to plain JSON (handles _id & dates)
 */
export function toPlain<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}
