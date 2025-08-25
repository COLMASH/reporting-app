'use client'

import {
    Area,
    AreaChart as RechartsAreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { AreaChartProps } from './types'
import { cn } from '@/lib/utils'

export const AreaChart = ({
    data,
    areas,
    xAxisKey,
    config,
    height = 350,
    showGrid = true,
    showTooltip = true,
    stacked = false,
    className
}: AreaChartProps) => {
    const chartHeight = typeof height === 'number' ? `${height}px` : height

    const defaultConfig = areas.reduce(
        (acc, area, index) => {
            acc[area.dataKey] = {
                label: area.dataKey,
                color: area.color || `var(--chart-${(index % 5) + 1})`
            }
            return acc
        },
        {} as Record<string, { label: string; color: string }>
    )

    const chartConfig = config || defaultConfig

    return (
        <div className={cn('w-full', className)} style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
                <ChartContainer config={chartConfig}>
                    <RechartsAreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                        {showGrid && (
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        )}

                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 11 }}
                            className="text-muted-foreground"
                        />

                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={value => `${value}%`}
                            className="text-muted-foreground"
                        />

                        {showTooltip && <ChartTooltip />}

                        {areas.map((area, index) => (
                            <Area
                                key={area.dataKey}
                                type={area.type || 'monotone'}
                                dataKey={area.dataKey}
                                stackId={stacked ? area.stackId || '1' : undefined}
                                stroke={area.color || `var(--chart-${(index % 5) + 1})`}
                                fill={area.color || `var(--chart-${(index % 5) + 1})`}
                                fillOpacity={area.fillOpacity || 0.6}
                                strokeWidth={area.strokeWidth || 2}
                            />
                        ))}
                    </RechartsAreaChart>
                </ChartContainer>
            </ResponsiveContainer>
        </div>
    )
}
