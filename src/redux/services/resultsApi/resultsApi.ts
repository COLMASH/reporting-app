import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '@/redux/services/baseQuery'
import {
    ResultResponse,
    ResultListResponse,
    GetUserResultsParams,
    ResultStatistics
} from './resultsApi.types'

export const resultsApi = createApi({
    reducerPath: 'resultsApi',
    baseQuery: createBaseQuery(),
    tagTypes: ['Result', 'Analysis', 'File'],
    endpoints: builder => ({
        // Get a single result by ID
        getResult: builder.query<ResultResponse, string>({
            query: id => `/api/v1/results/${id}`,
            providesTags: (result, error, id) => [{ type: 'Result', id }]
        }),

        // Get all results for an analysis
        getAnalysisResults: builder.query<ResultListResponse, string>({
            query: analysisId => `/api/v1/results/analysis/${analysisId}`,
            providesTags: (result, error, analysisId) => [
                { type: 'Result' },
                { type: 'Analysis', id: analysisId }
            ]
        }),

        // Get all results for a file
        getFileResults: builder.query<ResultListResponse, string>({
            query: fileId => `/api/v1/results/file/${fileId}`,
            providesTags: (result, error, fileId) => [
                { type: 'Result' },
                { type: 'File', id: fileId }
            ]
        }),

        // Get current user's results with pagination
        getUserResults: builder.query<ResultListResponse, GetUserResultsParams | void>({
            query: params => {
                const searchParams = new URLSearchParams()
                if (params?.result_type) searchParams.append('result_type', params.result_type)
                if (params?.page) searchParams.append('page', params.page.toString())
                if (params?.page_size) searchParams.append('page_size', params.page_size.toString())

                const queryString = searchParams.toString()
                return `/api/v1/results/user/me${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['Result']
        }),

        // Get result statistics for current user
        getResultStatistics: builder.query<ResultStatistics, void>({
            query: () => '/api/v1/results/statistics',
            providesTags: ['Result']
        }),

        // Delete a result
        deleteResult: builder.mutation<void, string>({
            query: id => ({
                url: `/api/v1/results/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Result', id }, { type: 'Result' }]
        })
    })
})

export const {
    useGetResultQuery,
    useGetAnalysisResultsQuery,
    useGetFileResultsQuery,
    useGetUserResultsQuery,
    useGetResultStatisticsQuery,
    useDeleteResultMutation
} = resultsApi
