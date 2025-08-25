'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage, getPerformanceTrend } from '../../utils/portfolio-utils'

export interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    change?: number
    changeLabel?: string
    icon?: LucideIcon
    showProgress?: boolean
    progressValue?: number
    progressMax?: number
    format?: 'currency' | 'percentage' | 'number' | 'custom'
    currency?: string
    className?: string
    onClick?: () => void
}

export const MetricCard = ({
    title,
    value,
    subtitle,
    change,
    changeLabel = 'vs last period',
    icon: Icon,
    showProgress = false,
    progressValue = 0,
    progressMax = 100,
    format = 'custom',
    currency = 'EUR',
    className,
    onClick
}: MetricCardProps) => {
    const formatValue = () => {
        if (format === 'currency' && typeof value === 'number') {
            return formatCurrency(value, currency, true)
        }
        if (format === 'percentage' && typeof value === 'number') {
            return formatPercentage(value)
        }
        if (format === 'number' && typeof value === 'number') {
            return value.toLocaleString()
        }
        return value
    }

    const PerformanceIndicator = ({ value }: { value: number }) => {
        const trend = getPerformanceTrend(value)

        return (
            <div
                className={cn('flex items-center gap-1', {
                    'text-success': trend === 'positive',
                    'text-destructive': trend === 'negative',
                    'text-muted-foreground': trend === 'neutral'
                })}
            >
                {trend === 'positive' && <TrendingUp className="h-4 w-4" />}
                {trend === 'negative' && <TrendingDown className="h-4 w-4" />}
                {trend === 'neutral' && <Minus className="h-4 w-4" />}
                <span className="font-semibold">{formatPercentage(value, true)}</span>
            </div>
        )
    }

    return (
        <Card
            className={cn('transition-all', onClick && 'cursor-pointer hover:shadow-lg', className)}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
                {Icon && (
                    <div className="bg-muted rounded-full p-2">
                        <Icon className="text-muted-foreground h-4 w-4" />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{formatValue()}</div>
                        {subtitle && (
                            <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
                        )}
                    </div>
                    {change !== undefined && (
                        <div className="text-right">
                            <PerformanceIndicator value={change} />
                            <p className="text-muted-foreground mt-1 text-xs">{changeLabel}</p>
                        </div>
                    )}
                </div>
                {showProgress && (
                    <div className="mt-3 space-y-1">
                        <Progress value={(progressValue / progressMax) * 100} className="h-2" />
                        <div className="text-muted-foreground flex justify-between text-xs">
                            <span>{progressValue.toLocaleString()}</span>
                            <span>{progressMax.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
