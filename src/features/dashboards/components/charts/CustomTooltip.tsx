'use client'

import { ExternalLink } from 'lucide-react'
import { formatCurrency } from '../../utils/portfolio-utils'
import { cn } from '@/lib/utils'

export interface TooltipDataItem {
    name?: string
    value?: number | string
    percentage?: number
    count?: number
    return?: number
    totalReturn?: number
    assets?: number
    avgReturn?: number
    currency?: string
    [key: string]: unknown
}

export interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{ payload: TooltipDataItem }>
    label?: string
    showClickHint?: boolean
    currencyCode?: string
}

export const CustomTooltip = ({
    active,
    payload,
    label,
    showClickHint = false,
    currencyCode = 'EUR'
}: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload

    return (
        <div className="bg-background rounded-lg border p-3 shadow-lg">
            <p className="font-semibold">{data.name || label}</p>

            <div className="mt-2 space-y-1">
                {data.value !== undefined && (
                    <p className="text-sm">
                        <span className="text-muted-foreground">Value:</span>{' '}
                        <span className="font-medium">
                            {typeof data.value === 'number'
                                ? formatCurrency(data.value, currencyCode, true)
                                : data.value}
                        </span>
                    </p>
                )}

                {data.return !== undefined && (
                    <p className="text-sm">
                        <span className="text-muted-foreground">Return:</span>{' '}
                        <span
                            className={cn('font-medium', {
                                'text-success': data.return > 0,
                                'text-destructive': data.return < 0,
                                'text-muted-foreground': data.return === 0
                            })}
                        >
                            {data.totalReturn !== undefined && (
                                <>
                                    {data.totalReturn >= 0 ? '+' : ''}
                                    {formatCurrency(data.totalReturn, currencyCode, true)}{' '}
                                </>
                            )}
                            ({data.return >= 0 ? '+' : ''}
                            {data.return.toFixed(1)}%)
                        </span>
                    </p>
                )}

                {data.percentage !== undefined && (
                    <p className="text-sm">
                        <span className="text-muted-foreground">Share:</span>{' '}
                        <span className="font-medium">{data.percentage.toFixed(1)}%</span>
                    </p>
                )}

                {data.count !== undefined && (
                    <p className="text-sm">
                        <span className="text-muted-foreground">Count:</span>{' '}
                        <span className="font-medium">{data.count}</span>
                    </p>
                )}

                {data.assets !== undefined && (
                    <p className="text-sm">
                        <span className="text-muted-foreground">Assets:</span>{' '}
                        <span className="font-medium">{data.assets}</span>
                    </p>
                )}

                {data.avgReturn !== undefined && (
                    <p className="text-sm">
                        <span className="text-muted-foreground">Avg Return:</span>{' '}
                        <span className="font-medium">{data.avgReturn.toFixed(1)}%</span>
                    </p>
                )}
            </div>

            {showClickHint && (
                <p className="text-primary mt-2 flex items-center gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" />
                    Click to view details
                </p>
            )}
        </div>
    )
}
