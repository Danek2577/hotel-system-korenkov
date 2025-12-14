/**
 * Convert Date to Unix timestamp (seconds)
 */
export const dateToUnix = (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
};

/**
 * Convert Unix timestamp to Date
 */
export const unixToDate = (unix: number): Date => {
    return new Date(unix * 1000);
};

/**
 * Format Unix timestamp to Russian date string
 */
export const formatDate = (unix: number): string => {
    return unixToDate(unix).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Format Unix timestamp to Russian datetime string
 */
export const formatDateTime = (unix: number): string => {
    return unixToDate(unix).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format price in Russian rubles
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(price);
};

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (startUnix: number, endUnix: number): number => {
    return Math.ceil((endUnix - startUnix) / 86400);
};
