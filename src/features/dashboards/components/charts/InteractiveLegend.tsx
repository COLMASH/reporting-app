'use client'

import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LegendItem {
    name: string
    value?: number | string
    percentage?: number
    color?: string
    fill?: string
    onClick?: () => void
}

export interface InteractiveLegendProps {
    items: LegendItem[]
    columns?: 1 | 2 | 3 | 4
    showValue?: boolean
    showPercentage?: boolean
    className?: string
}

export const InteractiveLegend = ({
    items,
    columns = 2,
    showValue = false,
    showPercentage = true,
    className
}: InteractiveLegendProps) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
    }

    return (
        <div className={cn(`grid ${gridCols[columns]} gap-2`, className)}>
            {items.map((item, index) => {
                const Component = item.onClick ? 'button' : 'div'
                const color = item.color || item.fill || `var(--chart-${(index % 5) + 1})`

                return (
                    <Component
                        key={index}
                        onClick={item.onClick}
                        className={cn(
                            'flex items-center justify-between rounded-lg p-2 transition-colors',
                            item.onClick && 'hover:bg-muted/50 cursor-pointer text-left'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {showValue && item.value !== undefined && (
                                <span className="text-sm font-medium">{item.value}</span>
                            )}
                            {showPercentage && item.percentage !== undefined && (
                                <span className="text-sm font-medium">
                                    {item.percentage.toFixed(1)}%
                                </span>
                            )}
                            {item.onClick && (
                                <ExternalLink className="text-muted-foreground h-3 w-3" />
                            )}
                        </div>
                    </Component>
                )
            })}
        </div>
    )
}
