'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppSelector(state => state.themeSlice.theme)

    useEffect(() => {
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }, [theme])

    return <>{children}</>
}
