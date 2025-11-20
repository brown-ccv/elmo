/**
 * Converts a Date object to API date string format.
 * @param date - The date to convert
 * @returns Date string in format 'YYYY-MM-DDTHH:MM:SS'
 */
export function toAPIDateString(date: Date): string {
  // Returns 'YYYY-MM-DDTHH:MM:SS'
  return date.toISOString().replace(/\.\d{3}Z$/, '');
}
