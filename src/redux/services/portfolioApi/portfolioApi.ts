/**
 * RTK Query service for Portfolio API endpoints.
 * Provides hooks for fetching portfolio data, aggregations, and historical NAV.
 */

import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../baseQuery'
import { buildQueryString } from './portfolioApi.utils'
import type {
    FilterOptionsResponse,
    PortfolioAssetsParams,
    AssetListResponse,
    AssetResponse,
    AggregationParams,
    PortfolioSummaryResponse,
    EntityAggregationResponse,
    AssetTypeAggregationResponse,
    FlexibleAggregationParams,
    FlexibleAggregationResponse,
    HistoricalNavParams,
    HistoricalNavResponse
} from './portfolioApi.types'

export const portfolioApi = createApi({
    reducerPath: 'portfolioApi',
    baseQuery: createBaseQuery(),
    tagTypes: ['Portfolio', 'Filters', 'Assets', 'Aggregation'],
    endpoints: builder => ({
        // GET /api/v1/portfolio/filters
        // Returns distinct entities, asset_types, and report_dates for filter dropdowns
        getFilters: builder.query<FilterOptionsResponse, void>({
            query: () => '/api/v1/portfolio/filters',
            providesTags: ['Filters'],
            keepUnusedDataFor: 3600 // 1 hour - filters rarely change
        }),

        // GET /api/v1/portfolio/assets
        // Paginated asset list with filtering, sorting, and optional extension data
        getAssets: builder.query<AssetListResponse, PortfolioAssetsParams | void>({
            query: params => {
                const queryString = buildQueryString((params || {}) as Record<string, unknown>)
                return `/api/v1/portfolio/assets${queryString ? `?${queryString}` : ''}`
            },
            providesTags: result =>
                result
                    ? [
                          ...result.assets.map(({ id }) => ({
                              type: 'Assets' as const,
                              id
                          })),
                          { type: 'Assets', id: 'LIST' }
                      ]
                    : [{ type: 'Assets', id: 'LIST' }]
        }),

        // GET /api/v1/portfolio/assets/{id}
        // Single asset with full details (always includes extension data)
        getAsset: builder.query<AssetResponse, string>({
            query: assetId => `/api/v1/portfolio/assets/${assetId}`,
            providesTags: (_result, _error, assetId) => [{ type: 'Assets', id: assetId }]
        }),

        // GET /api/v1/portfolio/aggregations/summary
        // Portfolio KPIs: total assets, total value, paid-in capital, unfunded, avg return
        getSummary: builder.query<PortfolioSummaryResponse, AggregationParams | void>({
            query: params => {
                const queryString = buildQueryString((params || {}) as Record<string, unknown>)
                return `/api/v1/portfolio/aggregations/summary${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['Portfolio', 'Aggregation']
        }),

        // GET /api/v1/portfolio/aggregations/by-entity
        // Distribution by ownership entity (for donut chart)
        getByEntity: builder.query<EntityAggregationResponse, AggregationParams | void>({
            query: params => {
                const queryString = buildQueryString((params || {}) as Record<string, unknown>)
                return `/api/v1/portfolio/aggregations/by-entity${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['Aggregation']
        }),

        // GET /api/v1/portfolio/aggregations/by-asset-type
        // Distribution by asset type (for donut chart and summary table)
        getByAssetType: builder.query<AssetTypeAggregationResponse, AggregationParams | void>({
            query: params => {
                const queryString = buildQueryString((params || {}) as Record<string, unknown>)
                return `/api/v1/portfolio/aggregations/by-asset-type${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['Aggregation']
        }),

        // GET /api/v1/portfolio/aggregations/flexible
        // Flexible grouping by any dimension (geographic, currency, strategy, etc.)
        getFlexibleAggregation: builder.query<
            FlexibleAggregationResponse,
            FlexibleAggregationParams
        >({
            query: params => {
                const queryString = buildQueryString(params as unknown as Record<string, unknown>)
                return `/api/v1/portfolio/aggregations/flexible${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['Aggregation']
        }),

        // GET /api/v1/portfolio/aggregations/historical
        // Historical NAV time series (for stacked bar chart)
        getHistoricalNav: builder.query<HistoricalNavResponse, HistoricalNavParams | void>({
            query: params => {
                const queryString = buildQueryString((params || {}) as Record<string, unknown>)
                return `/api/v1/portfolio/aggregations/historical${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['Portfolio', 'Aggregation']
        })
    })
})

export const {
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
} = portfolioApi
