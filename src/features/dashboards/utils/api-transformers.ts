/**
 * Data transformation utilities for converting API responses to chart-friendly formats.
 * Handles null values gracefully with exclusion tracking for footnotes.
 */

import type {
    EntityAggregationResponse,
    AssetTypeAggregationResponse,
    FlexibleAggregationResponse,
    HistoricalNavResponse,
    AggregationGroup,
    AssetTypeGroup,
    FlexibleAggregationGroup
} from '@/redux/services/portfolioApi'

// ============================================================
// CHART DATA INTERFACES
// ============================================================

export interface PieChartDatum {
    name: string
    value: number
    percentage: number
    count: number
    fill: string
}

export interface BarChartDatum {
    category: string
    value: number
    percentage: number
    count: number
    fill: string
}

export interface TimeSeriesDatum {
    date: string
    [key: string]: string | number // entity names as dynamic keys
}

export interface TransformResult<T> {
    data: T[]
    hasExcludedNulls: boolean
    excludedCount: number
}

// ============================================================
// CHART COLORS
// ============================================================

const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
]

export const getChartColor = (index: number): string => {
    return CHART_COLORS[index % CHART_COLORS.length]
}

// ============================================================
// ENTITY AGGREGATION TRANSFORMERS
// ============================================================

/**
 * Transform entity aggregation data for pie/donut chart.
 * Filters out groups with null or zero values.
 */
export const transformEntityForPieChart = (
    data: EntityAggregationResponse | undefined
): TransformResult<PieChartDatum> => {
    if (!data) {
        return { data: [], hasExcludedNulls: false, excludedCount: 0 }
    }

    let excludedCount = 0
    const chartData: PieChartDatum[] = []

    data.groups.forEach((group: AggregationGroup, index: number) => {
        if (group.value_usd === null || group.value_usd === undefined) {
            excludedCount++
            return
        }

        chartData.push({
            name: group.name,
            value: group.value_usd,
            percentage: group.percentage,
            count: group.count,
            fill: getChartColor(index)
        })
    })

    return {
        data: chartData,
        hasExcludedNulls: excludedCount > 0,
        excludedCount
    }
}

// ============================================================
// ASSET TYPE AGGREGATION TRANSFORMERS
// ============================================================

/**
 * Transform asset type aggregation data for pie/donut chart.
 */
export const transformAssetTypeForPieChart = (
    data: AssetTypeAggregationResponse | undefined
): TransformResult<PieChartDatum> => {
    if (!data) {
        return { data: [], hasExcludedNulls: false, excludedCount: 0 }
    }

    let excludedCount = 0
    const chartData: PieChartDatum[] = []

    data.groups.forEach((group: AssetTypeGroup, index: number) => {
        if (group.value_usd === null || group.value_usd === undefined) {
            excludedCount++
            return
        }

        chartData.push({
            name: group.asset_type,
            value: group.value_usd,
            percentage: group.percentage,
            count: group.count,
            fill: getChartColor(index)
        })
    })

    return {
        data: chartData,
        hasExcludedNulls: excludedCount > 0,
        excludedCount
    }
}

/**
 * Transform asset type data for summary table.
 * Includes additional financial metrics.
 */
export interface AssetTypeSummaryRow {
    assetType: string
    valueUsd: number | null
    percentage: number
    count: number
    paidInCapitalUsd: number | null
    unfundedCommitmentUsd: number | null
}

export const transformAssetTypeForTable = (
    data: AssetTypeAggregationResponse | undefined
): AssetTypeSummaryRow[] => {
    if (!data) return []

    return data.groups.map((group: AssetTypeGroup) => ({
        assetType: group.asset_type,
        valueUsd: group.value_usd,
        percentage: group.percentage,
        count: group.count,
        paidInCapitalUsd: group.paid_in_capital_usd,
        unfundedCommitmentUsd: group.unfunded_commitment_usd
    }))
}

/**
 * Extract available asset types from aggregation response.
 * Returns a Set of asset type names that have non-zero values.
 * Used to dynamically show/hide tabs based on entity selection.
 */
export const getAvailableAssetTypes = (
    data: AssetTypeAggregationResponse | undefined
): Set<string> => {
    if (!data?.groups) return new Set()

    return new Set(data.groups.filter(g => g.count > 0).map(g => g.asset_type))
}

// ============================================================
// FLEXIBLE AGGREGATION TRANSFORMERS
// ============================================================

/**
 * Transform flexible aggregation data for bar chart.
 */
export const transformFlexibleForBarChart = (
    data: FlexibleAggregationResponse | undefined
): TransformResult<BarChartDatum> => {
    if (!data) {
        return { data: [], hasExcludedNulls: false, excludedCount: 0 }
    }

    let excludedCount = 0
    const chartData: BarChartDatum[] = []

    data.groups.forEach((group: FlexibleAggregationGroup, index: number) => {
        if (group.value_usd === null || group.value_usd === undefined) {
            excludedCount++
            return
        }

        chartData.push({
            category: group.label,
            value: group.value_usd,
            percentage: group.percentage,
            count: group.count,
            fill: getChartColor(index)
        })
    })

    return {
        data: chartData,
        hasExcludedNulls: excludedCount > 0,
        excludedCount
    }
}

// ============================================================
// HISTORICAL NAV TRANSFORMERS
// ============================================================

/**
 * Transform historical NAV data for stacked bar/area chart.
 * Pivots data from series format to time-based format.
 * @param data - Historical NAV response from API
 * @param currency - Currency to use for values ('USD' or 'EUR')
 */
export const transformHistoricalForChart = (
    data: HistoricalNavResponse | undefined,
    currency: 'USD' | 'EUR' = 'USD'
): TimeSeriesDatum[] => {
    if (!data || !data.series || data.series.length === 0) {
        return []
    }

    // Collect all unique dates across all series
    const dateMap = new Map<string, TimeSeriesDatum>()

    data.series.forEach(series => {
        series.data.forEach(point => {
            if (!dateMap.has(point.date)) {
                dateMap.set(point.date, { date: point.date })
            }
            const datum = dateMap.get(point.date)!
            // Use the appropriate currency value
            datum[series.name] = currency === 'EUR' ? point.value_eur : point.value_usd
        })
    })

    // Sort by date and return
    return Array.from(dateMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

/**
 * Get unique entity names from historical NAV data.
 * Used for chart legend and color mapping.
 */
export const getHistoricalNavEntities = (data: HistoricalNavResponse | undefined): string[] => {
    if (!data || !data.series) return []
    return data.series.map(s => s.name)
}

// ============================================================
// NULL VALUE UTILITIES
// ============================================================

/**
 * Check if any data has null values that were excluded.
 */
export const hasAnyExcludedNulls = (
    ...results: Array<TransformResult<unknown> | undefined>
): boolean => {
    return results.some(r => r?.hasExcludedNulls)
}

/**
 * Get total count of excluded null values.
 */
export const getTotalExcludedCount = (
    ...results: Array<TransformResult<unknown> | undefined>
): number => {
    return results.reduce((sum, r) => sum + (r?.excludedCount || 0), 0)
}

// ============================================================
// DATE FORMATTING FOR CHARTS
// ============================================================

/**
 * Format ISO date string to short month format (e.g., "Nov 25").
 */
export const formatChartDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

/**
 * Format ISO date string to month/year format (e.g., "Nov 2025").
 */
export const formatChartMonth = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    })
}
