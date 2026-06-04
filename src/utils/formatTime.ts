/**
 * Formats a time value in seconds to a "m:ss" display string.
 */
export function formatTime(time: number): string {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Returns a human-readable label for the verse repeat limit.
 */
export function getRepeatText(limit: number): string {
    if (limit === 1) return 'Play Once';
    if (limit === -1) return 'Repeat Infinitely';
    return `Repeat ${limit}x`;
}
