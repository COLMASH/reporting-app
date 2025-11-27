'use client'

/**
 * Dashboard header with title, report date selector, and refresh action.
 * Responsive: stacks vertically on mobile, horizontal on desktop.
 */

import { ReactNode } from 'react'
import { RefreshCw, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { ChartThemeSelector } from '../chart-theme-selector'
import { UserAvatar } from '@/features/auth/components/user-avatar'
import type { CurrencyType } from '../../hooks/use-portfolio-filters'

export interface DashboardHeaderProps {
    title: string
    subtitle?: string
    reportDates?: string[]
    selectedReportDate: string | null
    onReportDateChange: (date: string | null) => void
    currency: CurrencyType
    onCurrencyChange: (currency: CurrencyType) => void
    onRefresh: () => void
    isRefreshing?: boolean
    isLoading?: boolean
    mobileMenu?: ReactNode
}

export const DashboardHeader = ({
    title,
    subtitle,
    reportDates = [],
    selectedReportDate,
    onReportDateChange,
    currency,
    onCurrencyChange,
    onRefresh,
    isRefreshing = false,
    isLoading = false,
    mobileMenu
}: DashboardHeaderProps) => {
    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <header className="bg-background flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
                {/* Mobile hamburger menu */}
                {mobileMenu}
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Report Date Selector */}
                {isLoading ? (
                    <Skeleton className="h-9 w-full sm:w-48" />
                ) : reportDates.length > 0 ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
                        <Calendar className="text-muted-foreground hidden h-4 w-4 sm:block" />
                        <Select
                            value={selectedReportDate || 'all'}
                            onValueChange={value =>
                                onReportDateChange(value === 'all' ? null : value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Select report date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Latest Report</SelectItem>
                                {reportDates.map(date => (
                                    <SelectItem key={date} value={date}>
                                        {formatDateLabel(date)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : null}

                {/* Currency Toggle */}
                <div className="flex items-center rounded-md border">
                    <Button
                        variant={currency === 'USD' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 rounded-r-none px-3"
                        onClick={() => onCurrencyChange('USD')}
                    >
                        USD
                    </Button>
                    <Button
                        variant={currency === 'EUR' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 rounded-l-none px-3"
                        onClick={() => onCurrencyChange('EUR')}
                    >
                        EUR
                    </Button>
                </div>

                {/* Theme Toggle (Dark/Light Mode) */}
                <ThemeToggle />

                {/* Chart Theme Selector */}
                <ChartThemeSelector />

                {/* Refresh Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    <RefreshCw
                        className={cn('h-4 w-4', {
                            'animate-spin': isRefreshing
                        })}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>

                {/* User Profile */}
                <UserAvatar />
            </div>
        </header>
    )
}
