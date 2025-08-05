'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { selectTheme } from '@/redux/features/themeSlice'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppSelector(selectTheme)

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
