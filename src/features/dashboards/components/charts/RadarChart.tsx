'use client'

import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { RadarChartProps } from './types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/portfolio-utils'

export const RadarChart = ({
    data,
    dataKey,
    angleKey,
    config,
    height = 350,
    showGrid = true,
    showTooltip = true,
    fillOpacity = 0.6,
    dot = { r: 6 },
    className
}: RadarChartProps) => {
    const chartHeight = typeof height === 'number' ? `${height}px` : height

    const defaultConfig = {
        [dataKey]: {
            label: dataKey,
            color: 'var(--chart-1)'
        }
    }

    const chartConfig = config || defaultConfig

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderTooltipContent = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-background rounded-lg border p-3 shadow-lg">
                    <p className="font-semibold">{data[angleKey] || data.name}</p>
                    {data.value !== undefined && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            Value: {formatCurrency(data.value, 'EUR')}
                        </p>
                    )}
                    {data.percentage !== undefined && (
                        <p className="text-muted-foreground text-sm">
                            Share: {data.percentage.toFixed(1)}%
                        </p>
                    )}
                    {data.count !== undefined && (
                        <p className="text-muted-foreground text-sm">Count: {data.count}</p>
                    )}
                </div>
            )
        }
        return null
    }

    return (
        <div className={cn('h-full w-full', className)} style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
                <ChartContainer config={chartConfig}>
                    <RechartsRadarChart data={data}>
                        {showTooltip && (
                            <ChartTooltip cursor={false} content={renderTooltipContent} />
                        )}

                        <PolarAngleAxis
                            dataKey={angleKey}
                            tick={{ fontSize: 11 }}
                            className="text-muted-foreground"
                        />

                        {showGrid && <PolarGrid className="stroke-muted" radialLines={false} />}

                        <Radar
                            dataKey={dataKey}
                            stroke="var(--chart-1)"
                            fill="var(--chart-1)"
                            fillOpacity={fillOpacity}
                            dot={
                                dot
                                    ? {
                                          r: typeof dot === 'object' ? dot.r : 6,
                                          fillOpacity: 1,
                                          fill: 'var(--chart-1)'
                                      }
                                    : false
                            }
                        />
                    </RechartsRadarChart>
                </ChartContainer>
            </ResponsiveContainer>
        </div>
    )
}
