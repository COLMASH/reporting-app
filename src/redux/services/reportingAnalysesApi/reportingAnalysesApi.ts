import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '@/redux/services/baseQuery'
import {
    AnalysisCreateRequest,
    AnalysisResponse,
    AnalysisListResponse
} from './reportingAnalysesApi.types'

export const reportingAnalysesApi = createApi({
    reducerPath: 'reportingAnalysesApi',
    baseQuery: createBaseQuery(),
    tagTypes: ['Analysis', 'File'],
    endpoints: builder => ({
        // Create a new analysis
        createAnalysis: builder.mutation<AnalysisResponse, AnalysisCreateRequest>({
            query: body => ({
                url: '/api/v1/reporting_analysis/',
                method: 'POST',
                body
            }),
            invalidatesTags: (_result, _error, arg) => [
                'Analysis',
                { type: 'File', id: arg.file_id }
            ]
        }),

        // Get analysis by ID
        getAnalysis: builder.query<AnalysisResponse, string>({
            query: id => `/api/v1/reporting_analysis/${id}`,
            providesTags: (result, error, id) => [{ type: 'Analysis', id }]
        }),

        // Get all analyses for current user
        getUserAnalyses: builder.query<AnalysisListResponse, void>({
            query: () => '/api/v1/reporting_analysis/',
            providesTags: ['Analysis']
        }),

        // Get all analyses for a specific file
        getFileAnalyses: builder.query<AnalysisListResponse, string>({
            query: fileId => `/api/v1/reporting_analysis/file/${fileId}`,
            providesTags: (result, error, fileId) => [
                { type: 'Analysis' },
                { type: 'File', id: fileId }
            ]
        }),

        // Delete analysis
        deleteAnalysis: builder.mutation<void, string>({
            query: id => ({
                url: `/api/v1/reporting_analysis/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Analysis', id },
                { type: 'Analysis' },
                { type: 'File' }
            ]
        })
    })
})

export const {
    useCreateAnalysisMutation,
    useGetAnalysisQuery,
    useGetUserAnalysesQuery,
    useGetFileAnalysesQuery,
    useDeleteAnalysisMutation
} = reportingAnalysesApi
