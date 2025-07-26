'use client'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { SessionProvider } from 'next-auth/react'
import { ReduxProvider } from '@/redux/provider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ReduxProvider>
                <ThemeProvider>{children}</ThemeProvider>
            </ReduxProvider>
        </SessionProvider>
    )
}
