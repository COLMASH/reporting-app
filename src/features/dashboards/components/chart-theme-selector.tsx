'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { ChartTheme, chartThemeLabels } from '../config/chart-themes'
import { Palette } from 'lucide-react'

export const ChartThemeSelector = () => {
    const [theme, setTheme] = useState<ChartTheme>('default')

    useEffect(() => {
        const storedTheme = localStorage.getItem('chart-theme') as ChartTheme
        if (storedTheme && Object.keys(chartThemeLabels).includes(storedTheme)) {
            setTheme(storedTheme)
            applyTheme(storedTheme)
        } else {
            applyTheme('default')
        }
    }, [])

    const applyTheme = (selectedTheme: ChartTheme) => {
        document.documentElement.setAttribute('data-chart-theme', selectedTheme)
    }

    const handleThemeChange = (value: ChartTheme) => {
        setTheme(value)
        localStorage.setItem('chart-theme', value)
        applyTheme(value)
    }

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <Palette className="text-muted-foreground hidden h-4 w-4 sm:block" />
            <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="h-8 w-[100px] text-xs sm:w-[100px] sm:text-sm">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[120px]">
                    {Object.entries(chartThemeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-xs sm:text-sm">
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
