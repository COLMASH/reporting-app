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
        <div className="flex items-center gap-2">
            <Palette className="text-muted-foreground h-4 w-4" />
            <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(chartThemeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                value === 'default'
                                                    ? 'hsl(221 83% 53%)'
                                                    : value === 'green'
                                                      ? 'hsl(142 71% 35%)'
                                                      : value === 'amber'
                                                        ? 'hsl(38 92% 35%)'
                                                        : value === 'orange'
                                                          ? 'hsl(25 95% 38%)'
                                                          : value === 'rose'
                                                            ? 'hsl(346 77% 35%)'
                                                            : value === 'violet'
                                                              ? 'hsl(263 70% 35%)'
                                                              : 'hsl(217 91% 45%)'
                                        }}
                                    />
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                value === 'default'
                                                    ? 'hsl(25 95% 53%)'
                                                    : value === 'green'
                                                      ? 'hsl(142 71% 55%)'
                                                      : value === 'amber'
                                                        ? 'hsl(38 92% 55%)'
                                                        : value === 'orange'
                                                          ? 'hsl(25 95% 58%)'
                                                          : value === 'rose'
                                                            ? 'hsl(346 77% 55%)'
                                                            : value === 'violet'
                                                              ? 'hsl(263 70% 55%)'
                                                              : 'hsl(217 91% 65%)'
                                        }}
                                    />
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                value === 'default'
                                                    ? 'hsl(340 75% 55%)'
                                                    : value === 'green'
                                                      ? 'hsl(142 71% 75%)'
                                                      : value === 'amber'
                                                        ? 'hsl(38 92% 75%)'
                                                        : value === 'orange'
                                                          ? 'hsl(25 95% 78%)'
                                                          : value === 'rose'
                                                            ? 'hsl(346 77% 75%)'
                                                            : value === 'violet'
                                                              ? 'hsl(263 70% 75%)'
                                                              : 'hsl(217 91% 85%)'
                                        }}
                                    />
                                </div>
                                <span>{label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
