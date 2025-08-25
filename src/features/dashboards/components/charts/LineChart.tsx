'use client'

import {
    Line,
    LineChart as RechartsLineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChartProps } from './types'
import { cn } from '@/lib/utils'

export const LineChart = ({
    data,
    lines,
    xAxisKey,
    config,
    height = 350,
    showGrid = true,
    showTooltip = true,
    className
}: LineChartProps) => {
    const chartHeight = typeof height === 'number' ? `${height}px` : height

    const defaultConfig = lines.reduce(
        (acc, line, index) => {
            acc[line.dataKey] = {
                label: line.dataKey,
                color: line.color || `var(--chart-${(index % 5) + 1})`
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
                    <RechartsLineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        {showGrid && (
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        )}

                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 11 }}
                            className="text-muted-foreground"
                        />

                        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />

                        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}

                        {lines.map((line, index) => (
                            <Line
                                key={line.dataKey}
                                type={line.type || 'monotone'}
                                dataKey={line.dataKey}
                                stroke={line.color || `var(--chart-${(index % 5) + 1})`}
                                strokeWidth={line.strokeWidth || 2}
                                dot={line.dot !== false}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </RechartsLineChart>
                </ChartContainer>
            </ResponsiveContainer>
        </div>
    )
}
