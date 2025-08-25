'use client'

import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { PieChartProps } from './types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/portfolio-utils'
import { getChartColor } from '../../utils/chart-colors'

export const PieChart = ({
    data,
    config,
    height = 350,
    innerRadius = 0,
    outerRadius = 120,
    paddingAngle = 2,
    showLabel = true,
    showTooltip = true,
    labelFormatter,
    onSliceClick,
    className
}: PieChartProps) => {
    const chartHeight = typeof height === 'number' ? `${height}px` : height

    const defaultConfig = data.reduce(
        (acc, item, index) => {
            acc[item.name] = {
                label: item.name,
                color: item.fill || getChartColor(index)
            }
            return acc
        },
        {} as Record<string, { label: string; color: string }>
    )

    const chartConfig = config || defaultConfig

    const defaultLabelFormatter = (value: number, percentage: number) => {
        return `${percentage.toFixed(0)}%`
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderTooltipContent = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const percentage = (data.value / data.totalValue) * 100 || data.percentage

            return (
                <div className="bg-background rounded-lg border p-3 shadow-lg">
                    <p className="font-semibold">{data.name || data.fullName}</p>
                    {data.value && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            Value:{' '}
                            {typeof data.value === 'number'
                                ? formatCurrency(data.value, 'EUR')
                                : data.value}
                        </p>
                    )}
                    {percentage && (
                        <p className="text-muted-foreground text-sm">
                            Share: {percentage.toFixed(1)}%
                        </p>
                    )}
                    {data.count && (
                        <p className="text-muted-foreground text-sm">Count: {data.count}</p>
                    )}
                    {onSliceClick && (
                        <p className="text-primary mt-2 text-xs">Click to view details</p>
                    )}
                </div>
            )
        }
        return null
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0)
    const enrichedData = data.map(item => ({
        ...item,
        percentage: (item.value / totalValue) * 100,
        totalValue
    }))

    return (
        <div className={cn('w-full', className)} style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
                <ChartContainer config={chartConfig}>
                    <RechartsPieChart>
                        {showTooltip && <ChartTooltip content={renderTooltipContent} />}
                        <Pie
                            data={enrichedData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={paddingAngle}
                            label={
                                showLabel
                                    ? ({ percentage }) =>
                                          (labelFormatter || defaultLabelFormatter)(0, percentage)
                                    : false
                            }
                            labelLine={false}
                            onClick={onSliceClick}
                            style={onSliceClick ? { cursor: 'pointer' } : undefined}
                        >
                            {enrichedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill || getChartColor(index)}
                                />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </ResponsiveContainer>
        </div>
    )
}
