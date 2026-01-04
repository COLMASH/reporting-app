/**
 * RTK Query service for Portfolio Reports API endpoints.
 * Provides hooks for creating, fetching, and managing AI-generated portfolio reports.
 */

import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../baseQuery'
import type {
    CreateReportRequest,
    ReportResponse,
    ReportListResponse,
    ReportListParams
} from './portfolioReportsApi.types'

export const portfolioReportsApi = createApi({
    reducerPath: 'portfolioReportsApi',
    baseQuery: createBaseQuery(),
    tagTypes: ['Report'],
    endpoints: builder => ({
        // POST /api/v1/portfolio_reports/
        // Creates a new report (async - returns immediately with pending status)
        createReport: builder.mutation<ReportResponse, CreateReportRequest>({
            query: body => ({
                url: '/api/v1/portfolio_reports/',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Report']
        }),

        // GET /api/v1/portfolio_reports/{id}
        // Get single report by ID (use for polling during generation)
        getReport: builder.query<ReportResponse, string>({
            query: id => `/api/v1/portfolio_reports/${id}`,
            providesTags: (result, _error, id) => [{ type: 'Report', id }]
        }),

        // GET /api/v1/portfolio_reports/
        // List all reports for the authenticated user
        getReports: builder.query<ReportListResponse, ReportListParams | void>({
            query: (params = {}) => {
                const { limit = 20, offset = 0 } = params || {}
                return `/api/v1/portfolio_reports/?limit=${limit}&offset=${offset}`
            },
            providesTags: result =>
                result
                    ? [
                          ...result.reports.map(({ id }) => ({
                              type: 'Report' as const,
                              id
                          })),
                          { type: 'Report', id: 'LIST' }
                      ]
                    : [{ type: 'Report', id: 'LIST' }]
        }),

        // DELETE /api/v1/portfolio_reports/{id}
        // Permanently delete a report
        deleteReport: builder.mutation<void, string>({
            query: id => ({
                url: `/api/v1/portfolio_reports/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Report', id },
                { type: 'Report', id: 'LIST' }
            ]
        })
    })
})

export const {
    useCreateReportMutation,
    useGetReportQuery,
    useLazyGetReportQuery,
    useGetReportsQuery,
    useDeleteReportMutation
} = portfolioReportsApi
