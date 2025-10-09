/**
 * Shared date utilities
 */

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

export function getTodayString(): string {
  return formatDate(new Date())
}

export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  return {
    start: formatDate(start),
    end: formatDate(end),
  }
}

export function isToday(date: Date | string): boolean {
  return formatDate(date) === getTodayString()
}
