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

/**
 * Returns a human-readable label for the verse pause delay.
 */
export function getPauseDelayText(delay: number | 'equal'): string {
    if (delay === 0) return 'Off';
    if (delay === 'equal') return 'Equal to Ayah Length';
    return `${delay}s Pause`;
}

/**
 * Formats a timestamp into a human-readable relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
    if (!timestamp) return '';
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
}
