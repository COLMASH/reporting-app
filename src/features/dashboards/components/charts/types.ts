import { ChartConfig } from '@/components/ui/chart'
import { LucideIcon } from 'lucide-react'

export interface BaseChartProps {
    data: unknown[]
    config?: ChartConfig
    className?: string
    height?: number | string
    loading?: boolean
    error?: string | null
}

export interface ChartCardProps extends BaseChartProps {
    title: string
    description?: string
    icon?: LucideIcon
    footer?: React.ReactNode
    badge?: React.ReactNode
    actions?: React.ReactNode
    onClick?: () => void
}

export interface ChartTooltipProps {
    active?: boolean
    payload?: unknown[]
    label?: string
    formatter?: (value: unknown, name: string) => React.ReactNode
    labelFormatter?: (label: string) => string
}

export interface ChartLegendItem {
    name: string
    value: number | string
    percentage?: number
    fill?: string
    color?: string
    onClick?: () => void
}

export interface BarChartProps extends BaseChartProps {
    data: Array<Record<string, unknown>>
    dataKey: string
    xAxisKey: string
    variant?: 'default' | 'horizontal' | 'stacked' | 'grouped'
    showGrid?: boolean
    showTooltip?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    xAxisFormatter?: (value: unknown) => string
    yAxisFormatter?: (value: unknown) => string
    barRadius?: number | [number, number, number, number]
    onBarClick?: (data: unknown) => void
}

export interface PieChartProps extends BaseChartProps {
    data: Array<{
        name: string
        value: number
        fill?: string
    }>
    innerRadius?: number
    outerRadius?: number
    paddingAngle?: number
    showLabel?: boolean
    showTooltip?: boolean
    labelFormatter?: (value: number, percentage: number) => string
    onSliceClick?: (data: unknown) => void
}

export interface LineChartProps extends BaseChartProps {
    data: Array<Record<string, unknown>>
    lines: Array<{
        dataKey: string
        color?: string
        strokeWidth?: number
        dot?: boolean
        type?: 'linear' | 'monotone' | 'step'
    }>
    xAxisKey: string
    showGrid?: boolean
    showTooltip?: boolean
    showArea?: boolean
    areaOpacity?: number
}

export interface AreaChartProps extends BaseChartProps {
    data: Array<Record<string, unknown>>
    areas: Array<{
        dataKey: string
        stackId?: string
        color?: string
        fillOpacity?: number
        strokeWidth?: number
        type?: 'linear' | 'monotone' | 'step' | 'natural'
    }>
    xAxisKey: string
    showGrid?: boolean
    showTooltip?: boolean
    stacked?: boolean
    xAxisFormatter?: (value: unknown) => string
    yAxisFormatter?: (value: unknown) => string
    gridVertical?: boolean
    customTooltip?: (props: unknown) => React.ReactNode
}

export interface RadarChartProps extends BaseChartProps {
    data: Array<Record<string, unknown>>
    dataKey: string
    angleKey: string
    showGrid?: boolean
    showTooltip?: boolean
    fillOpacity?: number
    dot?: boolean | { r: number }
}

export interface RadialChartProps extends BaseChartProps {
    data: Array<{
        name: string
        value: number
        fill?: string
    }>
    dataKey?: string
    startAngle?: number
    endAngle?: number
    innerRadius?: number
    outerRadius?: number
}

export interface ScatterChartProps extends BaseChartProps {
    data: Array<Record<string, unknown>>
    xKey: string
    yKey: string
    zKey?: string
    showGrid?: boolean
    showTooltip?: boolean
    shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye'
}

export interface ComposedChartProps extends BaseChartProps {
    data: Array<Record<string, unknown>>
    xAxisKey: string
    bars?: Array<{
        dataKey: string
        color?: string
        radius?: number | [number, number, number, number]
    }>
    lines?: Array<{
        dataKey: string
        color?: string
        strokeWidth?: number
        dot?: boolean
    }>
    areas?: Array<{
        dataKey: string
        color?: string
        fillOpacity?: number
    }>
    showGrid?: boolean
    showTooltip?: boolean
}

export type ChartVariant =
    | 'bar'
    | 'bar-horizontal'
    | 'bar-stacked'
    | 'bar-grouped'
    | 'pie'
    | 'pie-donut'
    | 'pie-label'
    | 'line'
    | 'line-dots'
    | 'line-area'
    | 'area'
    | 'area-stacked'
    | 'area-gradient'
    | 'radar'
    | 'radial'
    | 'scatter'
    | 'composed'

export interface ChartTheme {
    colors: string[]
    grid?: {
        stroke?: string
        strokeDasharray?: string
    }
    axis?: {
        stroke?: string
        fontSize?: number
    }
    tooltip?: {
        backgroundColor?: string
        borderColor?: string
        textColor?: string
    }
}
