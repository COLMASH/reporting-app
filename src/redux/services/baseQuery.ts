import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const createBaseQuery = (baseUrl: string = API_URL) =>
    fetchBaseQuery({
        baseUrl,
        prepareHeaders: async headers => {
            const session = await getSession()
            if (session?.accessToken) {
                headers.set('authorization', `Bearer ${session.accessToken}`)
            }
            return headers
        }
    })
