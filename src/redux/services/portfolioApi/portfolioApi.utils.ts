/**
 * Utility functions for Portfolio API service.
 * Handles query string building and null-safe value handling.
 */

/**
 * Build URL query string from params object.
 * Handles null/undefined values gracefully.
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.append(key, String(value))
        }
    })

    return searchParams.toString()
}

/**
 * Safe number accessor - returns 0 for null/undefined values.
 * Use for calculations where null should be treated as zero.
 */
export const safeNumber = (value: number | null | undefined): number => {
    return value ?? 0
}

/**
 * Safe number accessor with fallback - returns fallback for null/undefined.
 * Use when you need a specific default other than 0.
 */
export const safeNumberWithFallback = (
    value: number | null | undefined,
    fallback: number
): number => {
    return value ?? fallback
}

/**
 * Check if a numeric value is meaningful (not null/undefined).
 * Use for conditional rendering.
 */
export const hasValue = (value: number | null | undefined): boolean => {
    return value !== null && value !== undefined
}

/**
 * Check if a numeric value is meaningful and non-zero.
 */
export const hasNonZeroValue = (value: number | null | undefined): boolean => {
    return value !== null && value !== undefined && value !== 0
}

/**
 * Format currency with compact notation (e.g., $1.2M, $500K).
 * Handles null gracefully by returning 'N/A'.
 */
export const formatCompactCurrency = (
    value: number | null | undefined,
    currency: 'USD' | 'EUR' = 'USD'
): string => {
    if (value === null || value === undefined) return 'N/A'

    const symbol = currency === 'EUR' ? '\u20AC' : '$'
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (absValue >= 1e9) {
        return `${sign}${symbol}${(absValue / 1e9).toFixed(2)}B`
    } else if (absValue >= 1e6) {
        return `${sign}${symbol}${(absValue / 1e6).toFixed(2)}M`
    } else if (absValue >= 1e3) {
        return `${sign}${symbol}${(absValue / 1e3).toFixed(1)}K`
    }
    return `${sign}${symbol}${absValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format currency with full precision.
 * Handles null gracefully by returning 'N/A'.
 */
export const formatCurrency = (
    value: number | null | undefined,
    currency: 'USD' | 'EUR' = 'USD'
): string => {
    if (value === null || value === undefined) return 'N/A'

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value)
}

/**
 * Format currency with full numbers (no abbreviations) and no decimal places.
 * Used for main KPI cards where full precision is required.
 * Handles null gracefully by returning 'N/A'.
 */
export const formatFullCurrency = (
    value: number | null | undefined,
    currency: 'USD' | 'EUR' = 'USD'
): string => {
    if (value === null || value === undefined) return 'N/A'

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

/**
 * Format percentage from decimal (0.15 -> 15.0%).
 * Handles null gracefully by returning 'N/A'.
 */
export const formatPercentage = (
    value: number | null | undefined,
    decimals: number = 1
): string => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format percentage with sign indicator (+15.0%, -5.2%).
 * Handles null gracefully by returning 'N/A'.
 */
export const formatPercentageWithSign = (
    value: number | null | undefined,
    decimals: number = 1
): string => {
    if (value === null || value === undefined) return 'N/A'
    const formatted = `${Math.abs(value * 100).toFixed(decimals)}%`
    if (value > 0) return `+${formatted}`
    if (value < 0) return `-${formatted}`
    return formatted
}

/**
 * Format a number with thousand separators.
 * Handles null gracefully by returning 'N/A'.
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
    if (value === null || value === undefined) return 'N/A'
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
}

/**
 * Parse ISO date string to Date object.
 * Returns null for null/undefined/empty strings.
 */
export const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
}

/**
 * Format date to display string (e.g., "Nov 25, 2025").
 * Returns 'N/A' for null/invalid dates.
 */
export const formatDate = (dateStr: string | null | undefined): string => {
    const date = parseDate(dateStr)
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

/**
 * Format date to short format (e.g., "Nov 25").
 * Returns 'N/A' for null/invalid dates.
 */
export const formatDateShort = (dateStr: string | null | undefined): string => {
    const date = parseDate(dateStr)
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

/**
 * Calculate return percentage from value and cost.
 * Handles null values gracefully.
 */
export const calculateReturnPercentage = (
    currentValue: number | null | undefined,
    costBasis: number | null | undefined
): number | null => {
    const value = safeNumber(currentValue)
    const cost = safeNumber(costBasis)

    if (cost === 0) return null
    return (value - cost) / cost
}

/**
 * Get performance color class based on value.
 * Returns green for positive, red for negative, empty for null/zero (uses default color).
 */
export const getPerformanceColorClass = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return ''
    if (value > 0) return 'text-success'
    if (value < 0) return 'text-destructive'
    return ''
}
