'use client'

import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Cell,
    XAxis,
    YAxis,
    ResponsiveContainer
} from 'recharts'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from '@/components/ui/chart'
import { BarChartProps } from './types'
import { cn } from '@/lib/utils'
import { getChartColor } from '../../utils/chart-colors'

export const BarChart = ({
    data,
    dataKey,
    xAxisKey,
    variant = 'default',
    config,
    height = 350,
    showGrid = true,
    showTooltip = true,
    showXAxis = true,
    showYAxis = true,
    xAxisFormatter,
    yAxisFormatter,
    barRadius = 4,
    onBarClick,
    className
}: BarChartProps) => {
    const isHorizontal = variant === 'horizontal'
    const chartHeight = typeof height === 'number' ? `${height}px` : height

    const defaultConfig = data.reduce((acc, _, index) => {
        const key = `bar-${index}`
        acc[key] = {
            label: key,
            color: getChartColor(index)
        }
        return acc
    }, {} as ChartConfig)

    const chartConfig = (config as ChartConfig) || defaultConfig

    return (
        <div className={cn('w-full', className)} style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
                <ChartContainer config={chartConfig}>
                    <RechartsBarChart
                        data={data}
                        layout={isHorizontal ? 'horizontal' : 'vertical'}
                        margin={isHorizontal ? { left: -20 } : undefined}
                    >
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                                vertical={!isHorizontal}
                                horizontal={isHorizontal}
                            />
                        )}

                        {isHorizontal ? (
                            <>
                                {showXAxis && (
                                    <XAxis
                                        type="number"
                                        dataKey={dataKey}
                                        hide={!showXAxis}
                                        tickFormatter={xAxisFormatter}
                                    />
                                )}
                                {showYAxis && (
                                    <YAxis
                                        dataKey={xAxisKey}
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={
                                            yAxisFormatter || (value => String(value).slice(0, 3))
                                        }
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                {showXAxis && (
                                    <XAxis
                                        dataKey={xAxisKey}
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        fontSize={11}
                                        tickFormatter={xAxisFormatter}
                                    />
                                )}
                                {showYAxis && (
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                        tickFormatter={yAxisFormatter}
                                    />
                                )}
                            </>
                        )}

                        {showTooltip && (
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        )}

                        <Bar
                            dataKey={dataKey}
                            radius={barRadius}
                            onClick={onBarClick}
                            style={onBarClick ? { cursor: 'pointer' } : undefined}
                        >
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {data.map((entry: any, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill || getChartColor(index)}
                                />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ChartContainer>
            </ResponsiveContainer>
        </div>
    )
}
