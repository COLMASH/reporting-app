'use client'

/**
 * Donut chart showing portfolio distribution by asset type.
 * Uses API data transformer with null value exclusion tracking.
 */

import { useMemo } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShimmerOverlay } from '@/components/ui/shimmer-overlay'
import { PieChartIcon } from 'lucide-react'
import {
    transformAssetTypeForPieChart,
    type PieChartDatum,
    type TransformResult
} from '../../utils/api-transformers'
import { getChartColor } from '../../utils/chart-colors'
import { formatCompactCurrency } from '@/redux/services/portfolioApi'
import type { AssetTypeAggregationResponse } from '@/redux/services/portfolioApi'
import type { CurrencyType } from '../../hooks/use-portfolio-filters'

export interface AssetTypeDonutChartProps {
    data: AssetTypeAggregationResponse | undefined
    currency: CurrencyType
    isLoading?: boolean
    isFetching?: boolean
    onAssetTypeClick?: (assetType: string) => void
}

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{ payload: PieChartDatum }>
    currency: CurrencyType
}

const CustomTooltip = ({ active, payload, currency }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    return (
        <div className="bg-background rounded-lg border p-3 shadow-lg">
            <p className="font-semibold">{data.name}</p>
            <p className="text-muted-foreground mt-1 text-sm">
                Value: {formatCompactCurrency(data.value, currency)}
            </p>
            <p className="text-muted-foreground text-sm">Share: {data.percentage.toFixed(1)}%</p>
            <p className="text-muted-foreground text-sm">Positions: {data.count}</p>
        </div>
    )
}

// Custom label renderer - always visible on chart
interface CustomLabelProps {
    cx: number
    cy: number
    midAngle: number
    outerRadius: number
    name: string
    value: number
    percentage: number
    currency: CurrencyType
}

const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    name,
    value,
    percentage,
    currency
}: CustomLabelProps) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 30
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text
            x={x}
            y={y}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="fill-foreground text-[10px]"
        >
            {name} - {formatCompactCurrency(value, currency)} ({percentage.toFixed(1)}%)
        </text>
    )
}

export const AssetTypeDonutChart = ({
    data,
    currency,
    isLoading = false,
    isFetching = false,
    onAssetTypeClick
}: AssetTypeDonutChartProps) => {
    // Transform data and apply currency selection
    const transformResult: TransformResult<PieChartDatum> = useMemo(() => {
        const result = transformAssetTypeForPieChart(data)
        if (currency === 'EUR' && data?.groups) {
            // Use value_eur for chart values when EUR is selected
            return {
                ...result,
                data: result.data.map((item, i) => ({
                    ...item,
                    value: data.groups[i]?.value_eur ?? item.value
                }))
            }
        }
        return result
    }, [data, currency])

    const isLoadingState = isLoading || isFetching
    const { data: chartData, hasExcludedNulls, excludedCount } = transformResult

    // Wrapper for custom label that includes currency
    const labelRenderer = (props: Omit<CustomLabelProps, 'currency'>) =>
        renderCustomLabel({ ...props, currency })

    return (
        <Card className="relative">
            <ShimmerOverlay isActive={isLoadingState} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-medium">
                        Distribution by Asset Type ({currency})
                    </CardTitle>
                    <CardDescription>Portfolio allocation across asset classes</CardDescription>
                </div>
                <PieChartIcon className="text-muted-foreground h-5 w-5" />
            </CardHeader>
            <CardContent>
                {isLoadingState ? (
                    <div className="h-[300px]" />
                ) : chartData.length === 0 ? (
                    <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                        No data available
                    </div>
                ) : (
                    <>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        label={labelRenderer}
                                        labelLine={true}
                                        onClick={
                                            onAssetTypeClick
                                                ? entry => onAssetTypeClick(entry.name)
                                                : undefined
                                        }
                                        style={onAssetTypeClick ? { cursor: 'pointer' } : undefined}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill || getChartColor(index)}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {hasExcludedNulls && (
                            <p className="text-muted-foreground mt-2 text-center text-xs">
                                * {excludedCount} asset {excludedCount === 1 ? 'type' : 'types'}{' '}
                                excluded due to missing values
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
