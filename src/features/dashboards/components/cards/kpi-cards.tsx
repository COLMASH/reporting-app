'use client'

/**
 * KPI cards displaying key portfolio metrics.
 * Shows total NAV, cost basis, return, and position count.
 * Supports USD and EUR currency display.
 */

import { useMemo } from 'react'
import { DollarSign, TrendingUp, Briefcase, PiggyBank, BarChart3, Banknote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShimmerOverlay } from '@/components/ui/shimmer-overlay'
import {
    formatCompactCurrency,
    formatFullCurrency,
    formatPercentageWithSign,
    formatNumber,
    getPerformanceColorClass
} from '@/redux/services/portfolioApi'
import { cn } from '@/lib/utils'
import type { PortfolioSummaryResponse } from '@/redux/services/portfolioApi'
import type { CurrencyType } from '../../hooks/use-portfolio-filters'
import type { EurSummary } from '../../utils/currency-aggregations'

export interface KpiCardsProps {
    data: PortfolioSummaryResponse | undefined
    eurSummary?: EurSummary
    currency: CurrencyType
    isLoading?: boolean
    isFetching?: boolean
}

interface KpiCardConfig {
    title: string
    icon: React.ComponentType<{ className?: string }>
    getValue: () => string
    getSubValue?: () => string | null
    getColorClass?: () => string
}

export const KpiCards = ({
    data,
    eurSummary,
    currency,
    isLoading = false,
    isFetching = false
}: KpiCardsProps) => {
    const isLoadingState = isLoading || isFetching
    const isEur = currency === 'EUR'

    // Dynamic KPI config based on currency
    const kpiConfig: KpiCardConfig[] = useMemo(() => {
        // Helper to get value based on currency
        const getNav = () => {
            if (isEur) return eurSummary?.total_estimated_value_eur
            return data?.total_estimated_value_usd
        }

        const getCost = () => {
            if (isEur) return eurSummary?.total_paid_in_capital_eur
            return data?.total_paid_in_capital_usd
        }

        const getUnfunded = () => {
            if (isEur) return eurSummary?.total_unfunded_commitment_eur
            return data?.total_unfunded_commitment_usd
        }

        const getUnrealizedGain = () => {
            // Default to 0 when null (e.g., Real Estate assets)
            if (isEur) return eurSummary?.total_unrealized_gain_eur ?? 0
            return data?.total_unrealized_gain_usd ?? 0
        }

        const getRealizedGain = () => {
            // Default to 0 when null (no realized gains for this filter)
            if (isEur) return eurSummary?.total_realized_gain_eur ?? 0
            return data?.total_realized_gain_usd ?? 0
        }

        const getReturnAmount = () => {
            // Total Return = Unrealized Gain + Realized Gain
            return getUnrealizedGain() + getRealizedGain()
        }

        return [
            {
                title: `Total NAV (${currency})`,
                icon: DollarSign,
                getValue: () => formatFullCurrency(getNav(), currency)
            },
            {
                title: `Total Invested (${currency})`,
                icon: PiggyBank,
                getValue: () => formatFullCurrency(getCost(), currency)
            },
            {
                title: `Unrealized Gain/Loss (${currency})`,
                icon: BarChart3,
                getValue: () => formatFullCurrency(getUnrealizedGain(), currency),
                getColorClass: () => getPerformanceColorClass(getUnrealizedGain())
            },
            {
                title: `Realized Gain/Loss (${currency})`,
                icon: Banknote,
                getValue: () => formatFullCurrency(getRealizedGain(), currency),
                getColorClass: () => getPerformanceColorClass(getRealizedGain())
            },
            {
                title: 'Total Return',
                icon: TrendingUp,
                getValue: () => formatPercentageWithSign(data?.total_return_pct ?? 0, 2),
                getSubValue: () => formatFullCurrency(getReturnAmount(), currency),
                getColorClass: () => getPerformanceColorClass(data?.total_return_pct ?? 0)
            },
            {
                title: 'Positions',
                icon: Briefcase,
                getValue: () => formatNumber(data?.total_assets),
                getSubValue: () => {
                    const unfunded = getUnfunded()
                    if (!unfunded || unfunded <= 0) return null
                    return `${formatCompactCurrency(unfunded, currency)} unfunded`
                }
            }
        ]
    }, [data, eurSummary, currency, isEur])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpiConfig.map(config => {
                const value = data || (isEur && eurSummary) ? config.getValue() : '—'
                const subValue = data || (isEur && eurSummary) ? config.getSubValue?.() : null
                const colorClass = data ? config.getColorClass?.() : undefined

                return (
                    <Card key={config.title} className="relative">
                        <ShimmerOverlay isActive={isLoadingState} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                {config.title}
                            </CardTitle>
                            <config.icon className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={cn(
                                    'truncate text-lg font-bold sm:text-xl lg:text-2xl',
                                    colorClass
                                )}
                            >
                                {value}
                            </div>
                            {subValue && (
                                <p className="text-muted-foreground mt-1 text-xs">{subValue}</p>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
