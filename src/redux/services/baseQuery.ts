import {
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import { getSession, signOut } from 'next-auth/react'
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
            // Skip ngrok browser warning for API calls
            headers.set('ngrok-skip-browser-warning', 'true')
            return headers
        }
    })

    return async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions)

        // If there's an error, handle it appropriately
        if (result.error) {
            // Handle 401 - token expired, redirect to login
            if (result.error.status === 401) {
                // signOut clears session and redirects to home (login page)
                await signOut({ callbackUrl: '/' })
                return result
            }

            // Show error toast only for mutations (not GET queries)
            // This prevents error toasts on page load for failed queries
            const isQuery =
                typeof args === 'string' ||
                (args as FetchArgs).method === 'GET' ||
                !(args as FetchArgs).method
            if (!isQuery) {
                showApiError(result.error)
            }
        }

        return result
    }
}
