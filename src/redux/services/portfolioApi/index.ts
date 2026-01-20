/**
 * Portfolio API service exports.
 * Named exports only - no default exports per CLAUDE.md guidelines.
 */

// RTK Query API and hooks
export {
    portfolioApi,
    useGetFiltersQuery,
    useGetAssetsQuery,
    useLazyGetAssetsQuery,
    useGetAssetQuery,
    useLazyGetAssetQuery,
    useGetSummaryQuery,
    useGetByEntityQuery,
    useGetByAssetTypeQuery,
    useGetFlexibleAggregationQuery,
    useGetHistoricalNavQuery
} from './portfolioApi'

// Types
export type {
    GroupByField,
    SortOrder,
    PortfolioAssetsParams,
    AggregationParams,
    FlexibleAggregationParams,
    HistoricalNavParams,
    StructuredNoteResponse,
    RealEstateResponse,
    FilterOptionsResponse,
    AssetResponse,
    AssetListResponse,
    PortfolioSummaryResponse,
    AggregationGroup,
    EntityAggregationResponse,
    AssetTypeGroup,
    AssetTypeAggregationResponse,
    FlexibleAggregationGroup,
    FlexibleAggregationResponse,
    NavDataPoint,
    NavSeries,
    HistoricalNavResponse
} from './portfolioApi.types'

// Utility functions
export {
    buildQueryString,
    safeNumber,
    safeNumberWithFallback,
    hasValue,
    hasNonZeroValue,
    formatCompactCurrency,
    formatCurrency,
    formatFullCurrency,
    formatPercentage,
    formatPercentageWithSign,
    formatNumber,
    parseDate,
    formatDate,
    formatDateShort,
    calculateReturnPercentage,
    getPerformanceColorClass
} from './portfolioApi.utils'
