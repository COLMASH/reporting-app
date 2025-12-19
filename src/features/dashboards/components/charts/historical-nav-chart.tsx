'use client'

/**
 * Stacked bar chart showing historical NAV over time by holding company.
 * Uses API data transformer for time series pivoting.
 */

import { useMemo } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    LabelList
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShimmerOverlay } from '@/components/ui/shimmer-overlay'
import { TrendingUp } from 'lucide-react'
import {
    transformHistoricalForChart,
    getHistoricalNavEntities,
    formatChartMonth
} from '../../utils/api-transformers'
import { getChartColor } from '../../utils/chart-colors'
import { formatCompactCurrency } from '@/redux/services/portfolioApi'
import type { HistoricalNavResponse } from '@/redux/services/portfolioApi'
import type { CurrencyType } from '../../hooks/use-portfolio-filters'

export interface HistoricalNavChartProps {
    data: HistoricalNavResponse | undefined
    currency: CurrencyType
    isLoading?: boolean
    isFetching?: boolean
}

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
        dataKey: string
        value: number
        color: string
        name: string
    }>
    label?: string
    currency: CurrencyType
}

const CustomTooltip = ({ active, payload, label, currency }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null

    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)

    return (
        <div className="bg-background min-w-[180px] rounded-lg border p-3 shadow-lg">
            <p className="mb-2 font-semibold">{label ? formatChartMonth(label) : ''}</p>
            {payload.map((entry, index) => {
                const percentage = total > 0 ? (entry.value / total) * 100 : 0
                return (
                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2.5 w-2.5 rounded-sm"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">{entry.name}</span>
                        </div>
                        <span className="font-medium">
                            {formatCompactCurrency(entry.value, currency)} ({percentage.toFixed(1)}
                            %)
                        </span>
                    </div>
                )
            })}
            <div className="mt-2 flex justify-between border-t pt-2">
                <span className="text-muted-foreground text-sm">Total</span>
                <span className="font-semibold">{formatCompactCurrency(total, currency)}</span>
            </div>
        </div>
    )
}

// Custom label renderer for segment labels with percentage
interface SegmentLabelProps {
    x?: string | number
    y?: string | number
    width?: string | number
    height?: string | number
    value?: string | number
    index?: number
    chartData: Array<Record<string, unknown>>
    company: string
    currency: CurrencyType
}

const SegmentLabel = ({
    x,
    y,
    width,
    height,
    value,
    index,
    chartData,
    company,
    currency
}: SegmentLabelProps) => {
    const numX = typeof x === 'number' ? x : 0
    const numY = typeof y === 'number' ? y : 0
    const numWidth = typeof width === 'number' ? width : 0
    const numHeight = typeof height === 'number' ? height : 0
    const numValue = typeof value === 'number' ? value : 0

    // Skip if segment too small to label
    if (numHeight < 10) return null

    // Get total from chartData using index
    const dataEntry = typeof index === 'number' ? chartData[index] : null
    const total = dataEntry ? (dataEntry._total as number) : numValue
    const percentage = total > 0 ? (numValue / total) * 100 : 0

    return (
        <text
            x={numX + numWidth + 5}
            y={numY + numHeight / 2}
            dy={4}
            className="fill-foreground"
            fontSize={10}
            textAnchor="start"
        >
            {`${company} - ${formatCompactCurrency(numValue, currency)} (${percentage.toFixed(1)}%)`}
        </text>
    )
}

export const HistoricalNavChart = ({
    data,
    currency,
    isLoading = false,
    isFetching = false
}: HistoricalNavChartProps) => {
    const companies = useMemo(() => getHistoricalNavEntities(data), [data])

    // Transform data and add total field for labels
    const chartData = useMemo(() => {
        const transformed = transformHistoricalForChart(data, currency)
        return transformed.map(item => {
            const total = companies.reduce((sum, company) => {
                const val = item[company]
                return sum + (typeof val === 'number' ? val : 0)
            }, 0)
            return { ...item, _total: total }
        })
    }, [data, companies, currency])

    const isLoadingState = isLoading || isFetching

    // Format total for label
    const formatTotal = (value: number) => formatCompactCurrency(value, currency)

    return (
        <Card className="relative">
            <ShimmerOverlay isActive={isLoadingState} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-medium">
                        Historical NAV ({currency})
                    </CardTitle>
                    <CardDescription>Net asset value over time by holding company</CardDescription>
                </div>
                <TrendingUp className="text-muted-foreground h-5 w-5" />
            </CardHeader>
            <CardContent>
                {isLoadingState ? (
                    <div className="h-[350px]" />
                ) : chartData.length === 0 ? (
                    <div className="text-muted-foreground flex h-[350px] items-center justify-center">
                        No historical data available
                    </div>
                ) : (
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 25, right: 120, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    fontSize={11}
                                    tickFormatter={formatChartMonth}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    fontSize={11}
                                    tickFormatter={value => formatCompactCurrency(value, currency)}
                                />
                                <Tooltip
                                    content={<CustomTooltip currency={currency} />}
                                    cursor={false}
                                />
                                {companies.map((company, index) => (
                                    <Bar
                                        key={company}
                                        dataKey={company}
                                        stackId="1"
                                        fill={getChartColor(index)}
                                        maxBarSize={60}
                                    >
                                        {/* Segment label - company name + value + percentage */}
                                        <LabelList
                                            dataKey={company}
                                            content={props => {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                const p = props as any
                                                return (
                                                    <SegmentLabel
                                                        x={p.x}
                                                        y={p.y}
                                                        width={p.width}
                                                        height={p.height}
                                                        value={p.value}
                                                        index={p.index}
                                                        chartData={chartData}
                                                        company={company}
                                                        currency={currency}
                                                    />
                                                )
                                            }}
                                        />
                                        {/* Total label only on topmost bar */}
                                        {index === companies.length - 1 && (
                                            <LabelList
                                                dataKey="_total"
                                                position="top"
                                                formatter={formatTotal}
                                                className="fill-foreground"
                                                fontSize={10}
                                            />
                                        )}
                                    </Bar>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
