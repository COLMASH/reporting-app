// Agent schema types from backend - matches the Pydantic schemas
// These types are used for the structured output from the Excel analyzer agent

export interface KeyMetric {
    name: string
    value: string
    trend: 'up' | 'down' | 'stable'
    trend_value: string
    category: 'revenue' | 'cost' | 'performance' | 'other'
}

export interface BubbleDataPoint {
    x: number
    y: number
    r?: number
}

export interface ChartDataset {
    label: string
    data: (number | BubbleDataPoint | Record<string, unknown>)[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
    pointRadius?: number
    pointHoverRadius?: number
}

export interface ChartData {
    labels?: string[]
    datasets: ChartDataset[]
}

export interface ChartPlugins {
    legend?: Record<string, unknown>
    title?: Record<string, unknown>
    tooltip?: Record<string, unknown>
}

export interface ChartScales {
    x?: Record<string, unknown>
    y?: Record<string, unknown>
    [key: string]: Record<string, unknown> | undefined
}

export interface ChartOptions {
    responsive?: boolean
    maintainAspectRatio?: boolean
    aspectRatio?: number
    plugins?: ChartPlugins
    scales?: ChartScales
    animation?: Record<string, unknown>
    interaction?: Record<string, unknown>
}

export interface Visualization {
    chart_type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter'
    title: string
    description: string
    data: ChartData
    options: ChartOptions
    insights: string[]
}

export interface DataQuality {
    total_rows: number
    total_columns: number
    sheets_analyzed: string[]
    missing_values: Record<string, number>
    data_types: Record<string, string>
    quality_score: 'high' | 'medium' | 'low'
    issues: string[]
}

export interface ExcelAnalysisOutput {
    summary: string
    key_metrics: KeyMetric[]
    visualizations: Visualization[]
    data_quality: DataQuality
    recommendations: string[]
}
