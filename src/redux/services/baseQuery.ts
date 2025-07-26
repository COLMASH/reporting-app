import {
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import { getSession } from 'next-auth/react'
import { showApiError } from './errorHandler'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const createBaseQuery = (
    baseUrl: string = API_URL
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
    const baseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: async headers => {
            const session = await getSession()
            if (session?.accessToken) {
                headers.set('authorization', `Bearer ${session.accessToken}`)
            }
            return headers
        }
    })

    return async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions)

        // If there's an error, show it using our centralized handler
        if (result.error) {
            // Don't show error toast for query endpoints (only mutations)
            // This prevents error toasts on page load for failed queries
            const isQuery = typeof args === 'string' || (args as FetchArgs).method === 'GET'
            if (!isQuery) {
                showApiError(result.error)
            }
        }

        return result
    }
}
