'use client'

/**
 * Hook for composing portfolio dashboard data from multiple RTK Query endpoints.
 * Provides loading states, error handling, and manual refresh capability.
 */

import { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import {
    useGetFiltersQuery,
    useGetSummaryQuery,
    useGetByEntityQuery,
    useGetByAssetTypeQuery,
    useGetFlexibleAggregationQuery,
    useGetAssetsQuery,
    useGetHistoricalNavQuery,
    portfolioApi
} from '@/redux/services/portfolioApi'
import { useAppDispatch } from '@/redux/hooks'
import { usePortfolioFilters } from './use-portfolio-filters'
import type {
    FilterOptionsResponse,
    PortfolioSummaryResponse,
    EntityAggregationResponse,
    AssetTypeAggregationResponse,
    FlexibleAggregationResponse,
    AssetListResponse,
    HistoricalNavResponse,
    AggregationParams
} from '@/redux/services/portfolioApi'
import { type EurSummary } from '../utils/currency-aggregations'
import { getAvailableAssetTypes } from '../utils/api-transformers'

export interface DashboardDataState {
    // Raw API data
    filters: FilterOptionsResponse | undefined
    summary: PortfolioSummaryResponse | undefined
    byEntity: EntityAggregationResponse | undefined
    byAssetType: AssetTypeAggregationResponse | undefined
    byAssetGroup: FlexibleAggregationResponse | undefined
    byAssetGroupStrategy: FlexibleAggregationResponse | undefined
    assets: AssetListResponse | undefined
    historicalNav: HistoricalNavResponse | undefined

    // EUR aggregations (computed from all assets)
    eurSummary: EurSummary | undefined
    eurByEntity: EntityAggregationResponse | undefined
    eurByAssetType: AssetTypeAggregationResponse | undefined

    // Tab availability (excludes asset_type filter to show all available tabs)
    availableAssetTypes: Set<string>

    // Loading states
    isLoading: boolean
    isFetching: boolean
    isFiltersLoading: boolean
    isSummaryLoading: boolean
    isChartsLoading: boolean
    isAssetsLoading: boolean
    isEurLoading: boolean

    // Error state
    error: unknown

    // Actions
    refresh: () => void
}

/**
 * Custom hook to detect filter transitions and provide a brief "transitioning" state.
 * This ensures shimmer shows even when data comes from cache.
 */
const useFilterTransition = (queryParams: Record<string, string | undefined>) => {
    const [isTransitioning, setIsTransitioning] = useState(false)
    const prevParamsRef = useRef<string>('')
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const paramsKey = JSON.stringify(queryParams)

        // If params changed, start transition
        if (paramsKey !== prevParamsRef.current && prevParamsRef.current !== '') {
            setIsTransitioning(true)

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // End transition after a minimum duration (allows shimmer to be visible)
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false)
            }, 300)
        }

        prevParamsRef.current = paramsKey

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [queryParams])

    return isTransitioning
}

export const useDashboardData = (): DashboardDataState => {
    const dispatch = useAppDispatch()
    const { queryParams, filters } = usePortfolioFilters()
    const isEurSelected = filters.currency === 'EUR'

    // Track filter transitions to show shimmer even on cache hits
    const isTransitioning = useFilterTransition(queryParams)

    // API Queries - run in parallel
    const filtersQuery = useGetFiltersQuery()

    const summaryQuery = useGetSummaryQuery(queryParams as AggregationParams)

    const byEntityQuery = useGetByEntityQuery(queryParams as AggregationParams)

    const byAssetTypeQuery = useGetByAssetTypeQuery(queryParams as AggregationParams)

    // Tab availability: exclude asset_type to show all available tabs for selected entity
    const tabAvailabilityParams = useMemo((): AggregationParams => {
        const params: AggregationParams = {}
        if (queryParams.entity) params.entity = queryParams.entity
        if (queryParams.asset_group) params.asset_group = queryParams.asset_group
        if (queryParams.asset_group_strategy)
            params.asset_group_strategy = queryParams.asset_group_strategy
        if (queryParams.report_date) params.report_date = queryParams.report_date
        return params
    }, [queryParams])

    const byAssetTypeForTabsQuery = useGetByAssetTypeQuery(tabAvailabilityParams)

    const byAssetGroupQuery = useGetFlexibleAggregationQuery({
        ...queryParams,
        group_by: 'asset_group'
    })

    const byAssetGroupStrategyQuery = useGetFlexibleAggregationQuery({
        ...queryParams,
        group_by: 'asset_group_strategy'
    })

    const assetsQuery = useGetAssetsQuery({
        ...queryParams,
        page: 1,
        page_size: 20,
        sort_by: 'estimated_asset_value_usd',
        sort_order: 'desc'
    })

    const historicalNavQuery = useGetHistoricalNavQuery({
        ...queryParams,
        group_by_entity: true
    })

    // EUR aggregations - backend now provides EUR fields on all aggregation endpoints
    const eurSummary = useMemo((): EurSummary | undefined => {
        if (!isEurSelected || !summaryQuery.data) return undefined

        const data = summaryQuery.data
        return {
            total_estimated_value_eur: data.total_estimated_value_eur,
            total_paid_in_capital_eur: data.total_paid_in_capital_eur,
            total_unfunded_commitment_eur: data.total_unfunded_commitment_eur,
            total_return_amount_eur:
                data.total_estimated_value_eur - data.total_paid_in_capital_eur,
            total_assets: data.total_assets,
            weighted_avg_return: data.weighted_avg_return
        }
    }, [isEurSelected, summaryQuery.data])

    // EUR by entity - backend provides EUR fields directly
    const eurByEntity = useMemo((): EntityAggregationResponse | undefined => {
        if (!isEurSelected || !byEntityQuery.data) return undefined
        return byEntityQuery.data
    }, [isEurSelected, byEntityQuery.data])

    // EUR by asset type - backend provides EUR fields directly
    const eurByAssetType = useMemo((): AssetTypeAggregationResponse | undefined => {
        if (!isEurSelected || !byAssetTypeQuery.data) return undefined
        return byAssetTypeQuery.data
    }, [isEurSelected, byAssetTypeQuery.data])

    // Available asset types for tabs (uses query without asset_type filter)
    const availableAssetTypes = useMemo(
        () => getAvailableAssetTypes(byAssetTypeForTabsQuery.data),
        [byAssetTypeForTabsQuery.data]
    )

    // Compute combined loading states
    const isLoading = useMemo(
        () =>
            filtersQuery.isLoading ||
            summaryQuery.isLoading ||
            byEntityQuery.isLoading ||
            byAssetTypeQuery.isLoading ||
            byAssetGroupQuery.isLoading ||
            byAssetGroupStrategyQuery.isLoading ||
            assetsQuery.isLoading,
        [
            filtersQuery.isLoading,
            summaryQuery.isLoading,
            byEntityQuery.isLoading,
            byAssetTypeQuery.isLoading,
            byAssetGroupQuery.isLoading,
            byAssetGroupStrategyQuery.isLoading,
            assetsQuery.isLoading
        ]
    )

    const isFetching = useMemo(
        () =>
            isTransitioning ||
            filtersQuery.isFetching ||
            summaryQuery.isFetching ||
            byEntityQuery.isFetching ||
            byAssetTypeQuery.isFetching ||
            byAssetGroupQuery.isFetching ||
            byAssetGroupStrategyQuery.isFetching ||
            assetsQuery.isFetching ||
            historicalNavQuery.isFetching,
        [
            isTransitioning,
            filtersQuery.isFetching,
            summaryQuery.isFetching,
            byEntityQuery.isFetching,
            byAssetTypeQuery.isFetching,
            byAssetGroupQuery.isFetching,
            byAssetGroupStrategyQuery.isFetching,
            assetsQuery.isFetching,
            historicalNavQuery.isFetching
        ]
    )

    // EUR loading state - no separate loading needed once backend has EUR fields
    const isEurLoading = false

    // First error found
    const error = useMemo(
        () =>
            filtersQuery.error ||
            summaryQuery.error ||
            byEntityQuery.error ||
            byAssetTypeQuery.error ||
            byAssetGroupQuery.error ||
            byAssetGroupStrategyQuery.error ||
            assetsQuery.error ||
            historicalNavQuery.error,
        [
            filtersQuery.error,
            summaryQuery.error,
            byEntityQuery.error,
            byAssetTypeQuery.error,
            byAssetGroupQuery.error,
            byAssetGroupStrategyQuery.error,
            assetsQuery.error,
            historicalNavQuery.error
        ]
    )

    // Manual refresh - invalidates all portfolio cache
    const refresh = useCallback(() => {
        dispatch(
            portfolioApi.util.invalidateTags(['Portfolio', 'Filters', 'Assets', 'Aggregation'])
        )
    }, [dispatch])

    return {
        // Data
        filters: filtersQuery.data,
        summary: summaryQuery.data,
        byEntity: byEntityQuery.data,
        byAssetType: byAssetTypeQuery.data,
        byAssetGroup: byAssetGroupQuery.data,
        byAssetGroupStrategy: byAssetGroupStrategyQuery.data,
        assets: assetsQuery.data,
        historicalNav: historicalNavQuery.data,

        // EUR aggregations
        eurSummary,
        eurByEntity,
        eurByAssetType,

        // Tab availability
        availableAssetTypes,

        // Loading states
        isLoading,
        isFetching,
        isFiltersLoading: filtersQuery.isLoading,
        isSummaryLoading: summaryQuery.isLoading,
        isChartsLoading: byEntityQuery.isLoading || byAssetTypeQuery.isLoading,
        isAssetsLoading: assetsQuery.isLoading,
        isEurLoading,

        // Error
        error,

        // Actions
        refresh
    }
}

/**
 * Hook for fetching paginated asset list with sorting and filtering.
 * Used by the detailed data table component.
 */
export interface AssetTableParams {
    page: number
    pageSize: number
    sortBy: string
    sortOrder: 'asc' | 'desc'
    search?: string
}

export interface AssetTableState {
    data: AssetListResponse | undefined
    isLoading: boolean
    isFetching: boolean
    error: unknown
}

export const useAssetTable = (params: AssetTableParams): AssetTableState => {
    const { queryParams } = usePortfolioFilters()

    const query = useGetAssetsQuery({
        ...queryParams,
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_order: params.sortOrder,
        search: params.search
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error
    }
}
