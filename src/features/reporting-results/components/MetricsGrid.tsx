'use client'

import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KeyMetric } from '@/redux/services/reportingAnalysesApi'

interface MetricsGridProps {
    metrics: KeyMetric[]
    className?: string
}

const getCategoryIcon = (category: KeyMetric['category']) => {
    switch (category) {
        case 'revenue':
            return '💰'
        case 'cost':
            return '💸'
        case 'performance':
            return '📊'
        default:
            return '📈'
    }
}

const getTrendIcon = (trend: KeyMetric['trend']) => {
    switch (trend) {
        case 'up':
            return <TrendingUp className="h-4 w-4" />
        case 'down':
            return <TrendingDown className="h-4 w-4" />
        default:
            return <Minus className="h-4 w-4" />
    }
}

const getTrendColor = (trend: KeyMetric['trend'], category: KeyMetric['category']) => {
    if (trend === 'stable') return 'text-muted-foreground'

    // For costs, down is good (green) and up is bad (red)
    if (category === 'cost') {
        return trend === 'down' ? 'text-success' : 'text-destructive'
    }

    // For revenue and performance, up is good (green) and down is bad (red)
    return trend === 'up' ? 'text-success' : 'text-destructive'
}

export const MetricsGrid = ({ metrics, className }: MetricsGridProps) => {
    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                className
            )}
        >
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="bg-card group border-border relative overflow-hidden rounded-lg border p-6 transition-all hover:shadow-md/50 hover:shadow-md"
                >
                    {/* Background gradient effect on hover */}
                    <div className="to-primary/5 absolute inset-0 bg-gradient-to-br from-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative">
                        <div className="mb-4 flex items-start justify-between">
                            <span className="text-2xl">{getCategoryIcon(metric.category)}</span>
                            <div
                                className={cn(
                                    'flex items-center gap-1 text-sm font-medium',
                                    getTrendColor(metric.trend, metric.category)
                                )}
                            >
                                {getTrendIcon(metric.trend)}
                                <span>{metric.trend_value}</span>
                            </div>
                        </div>

                        <h3 className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
                            {metric.name}
                        </h3>

                        <p className="text-foreground text-2xl font-bold">{metric.value}</p>

                        {/* Trend indicator arrow */}
                        <div className="absolute right-2 bottom-2 opacity-10">
                            {metric.trend === 'up' && (
                                <ArrowUp className="text-foreground h-12 w-12" />
                            )}
                            {metric.trend === 'down' && (
                                <ArrowDown className="text-foreground h-12 w-12" />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
