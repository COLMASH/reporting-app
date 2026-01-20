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
 * @param data - Asset type aggregation response from API
 * @param currency - Currency to use for values ('USD' or 'EUR')
 */
export interface AssetTypeSummaryRow {
    assetType: string
    value: number | null
    percentage: number
    count: number
    paidInCapital: number | null
    unfundedCommitment: number | null
    unrealizedGain: number | null
}

export const transformAssetTypeForTable = (
    data: AssetTypeAggregationResponse | undefined,
    currency: 'USD' | 'EUR' = 'USD'
): AssetTypeSummaryRow[] => {
    if (!data) return []

    const isEur = currency === 'EUR'

    return data.groups.map((group: AssetTypeGroup) => ({
        assetType: group.asset_type,
        value: isEur ? group.value_eur : group.value_usd,
        percentage: group.percentage,
        count: group.count,
        paidInCapital: isEur ? group.paid_in_capital_eur : group.paid_in_capital_usd,
        unfundedCommitment: isEur ? group.unfunded_commitment_eur : group.unfunded_commitment_usd,
        unrealizedGain: isEur ? group.unrealized_gain_eur : group.unrealized_gain_usd
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

/**
 * Transform flexible aggregation data for summary table.
 * Used for asset subtype breakdown.
 * @param data - Flexible aggregation response from API
 * @param currency - Currency to use for values ('USD' or 'EUR')
 */
export const transformFlexibleForTable = (
    data: FlexibleAggregationResponse | undefined,
    currency: 'USD' | 'EUR' = 'USD'
): AssetTypeSummaryRow[] => {
    if (!data) return []

    const isEur = currency === 'EUR'

    return data.groups.map((group: FlexibleAggregationGroup) => ({
        assetType: group.label,
        value: isEur ? group.value_eur : group.value_usd,
        percentage: group.percentage,
        count: group.count,
        paidInCapital: isEur ? group.paid_in_capital_eur : group.paid_in_capital_usd,
        unfundedCommitment: isEur ? group.unfunded_commitment_eur : group.unfunded_commitment_usd,
        unrealizedGain: isEur ? group.unrealized_gain_eur : group.unrealized_gain_usd
    }))
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

/**
 * Transform flexible aggregation data for pie/donut chart.
 * Maps label to name field for pie chart compatibility.
 */
export const transformFlexibleForPieChart = (
    data: FlexibleAggregationResponse | undefined
): TransformResult<PieChartDatum> => {
    if (!data) {
        return { data: [], hasExcludedNulls: false, excludedCount: 0 }
    }

    let excludedCount = 0
    const chartData: PieChartDatum[] = []

    data.groups.forEach((group: FlexibleAggregationGroup, index: number) => {
        if (group.value_usd === null || group.value_usd === undefined) {
            excludedCount++
            return
        }

        chartData.push({
            name: group.label,
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

// ============================================================
// COMPANY SORTING UTILITIES
// ============================================================

/**
 * Sort holding company names by their NAV (Net Asset Value) in descending order.
 * Always uses USD for consistent sorting regardless of display currency.
 *
 * @param companies - Array of company names from filters
 * @param aggregationData - FlexibleAggregationResponse with company NAV data (should be unfiltered)
 * @returns Sorted array of company names (highest NAV first)
 */
export const sortCompaniesByNav = (
    companies: string[],
    aggregationData: FlexibleAggregationResponse | undefined
): string[] => {
    if (!aggregationData?.groups || companies.length === 0) {
        return companies
    }

    // Create a map of company name to NAV value (USD) for O(1) lookup
    const navMap = new Map<string, number>()
    aggregationData.groups.forEach(group => {
        navMap.set(group.label, group.value_usd ?? 0)
    })

    // Sort companies by NAV descending
    return [...companies].sort((a, b) => {
        const navA = navMap.get(a) ?? 0
        const navB = navMap.get(b) ?? 0
        return navB - navA
    })
}
