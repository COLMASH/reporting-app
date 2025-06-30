'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error) => {
                            // Don't retry on 4xx errors
                            if (error instanceof Error && 'status' in error) {
                                const status = (error as unknown as { status: number }).status
                                if (status >= 400 && status < 500) {
                                    return false
                                }
                            }
                            return failureCount < 3
                        }
                    },
                    mutations: {
                        onError: error => {
                            // eslint-disable-next-line no-console
                            console.error('Mutation error:', error)
                        }
                    }
                }
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>{children}</ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
