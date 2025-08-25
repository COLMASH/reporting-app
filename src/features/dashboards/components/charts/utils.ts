import { ChartConfig } from '@/components/ui/chart'

export const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
]

export const getChartColor = (index: number): string => {
    return CHART_COLORS[index % CHART_COLORS.length]
}

export const createChartConfig = (
    items: Array<{ key: string; label?: string; color?: string }>
): ChartConfig => {
    return items.reduce((acc, item, index) => {
        acc[item.key] = {
            label: item.label || item.key,
            color: item.color || getChartColor(index)
        }
        return acc
    }, {} as ChartConfig)
}

export const prepareChartData = <T extends Record<string, unknown>>(
    data: T[],
    config: {
        valueKey: string
        nameKey?: string
        colorKey?: string
        includePercentage?: boolean
    }
): Array<T & { percentage?: number; fill?: string }> => {
    const { valueKey, colorKey, includePercentage = true } = config

    const totalValue = data.reduce((sum, item) => {
        const value = item[valueKey]
        return sum + (typeof value === 'number' ? value : 0)
    }, 0)

    return data.map((item, index) => {
        const value = item[valueKey]
        const numericValue = typeof value === 'number' ? value : 0

        return {
            ...item,
            ...(includePercentage && { percentage: (numericValue / totalValue) * 100 }),
            fill: (item[colorKey || 'fill'] as string) || getChartColor(index)
        }
    })
}

export const formatChartValue = (
    value: unknown,
    format: 'currency' | 'percentage' | 'number' = 'number',
    options?: { currency?: string; decimals?: number }
): string => {
    if (typeof value !== 'number') return String(value)

    const { currency = 'EUR', decimals = 0 } = options || {}

    switch (format) {
        case 'currency':
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value)
        case 'percentage':
            return `${value.toFixed(decimals)}%`
        case 'number':
        default:
            return value.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })
    }
}

export const truncateLabel = (label: string, maxLength: number = 15): string => {
    if (label.length <= maxLength) return label
    return `${label.substring(0, maxLength)}...`
}
