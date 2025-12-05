import { Database } from "@/types/database";

// Define the timezone constant to avoid typos
export const THAI_TIMEZONE = 'Asia/Bangkok';

/**
 * Formats a date string or Date object into a localized string with Thai timezone.
 * Usage: formatDateThai(new Date(), { month: 'long', day: 'numeric' })
 */
export function formatDateThai(
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }
): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    // Ensure we are using the correct timezone
    const opts = { ...options, timeZone: THAI_TIMEZONE };

    return new Intl.DateTimeFormat('en-GB', opts).format(d);
}

/**
 * Returns the current Date object adjusted to Thai time (conceptually).
 * Note: JS Dates are always UTC/Local. This returns a Date object where 
 * the UTC components match the Thai wall time. Useful for calculations 
 * where you want to ignore the user's local browser timezone.
 */
export function getThaiDate(): Date {
    const now = new Date();
    const thaiTimeStr = now.toLocaleString('en-US', { timeZone: THAI_TIMEZONE });
    return new Date(thaiTimeStr);
}

/**
 * Checks if a given time (HH:mm) is within business hours in Thailand.
 */
export function isBusinessOpen(timeStr: string, open: string = "09:00", close: string = "20:00"): boolean {
    // Simple string comparison works for 24h format "HH:mm"
    return timeStr >= open && timeStr <= close;
}
