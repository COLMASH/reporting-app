'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    ResponsiveContainer,
    ComposedChart,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Cell,
    ScatterChart,
    Scatter,
    Tooltip
} from 'recharts'
import { ChartTooltip } from '@/components/ui/chart'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3,
    PieChart as PieChartIcon,
    Globe,
    Briefcase,
    DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { ChartThemeSelector } from './chart-theme-selector'
import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    parseNumericValue,
    getPerformanceTrend
} from '../utils/portfolio-utils'
import { ChartCard, InteractiveLegend, PieChart } from './charts'
import { prepareChartData, truncateLabel } from './charts/utils'

const PerformanceIndicator = ({
    value,
    showSign = true
}: {
    value: number
    showSign?: boolean
}) => {
    const trend = getPerformanceTrend(value)

    return (
        <div
            className={cn('flex items-center gap-1', {
                'text-success': trend === 'positive',
                'text-destructive': trend === 'negative',
                'text-muted-foreground': trend === 'neutral'
            })}
        >
            {trend === 'positive' && <TrendingUp className="h-4 w-4" />}
            {trend === 'negative' && <TrendingDown className="h-4 w-4" />}
            {trend === 'neutral' && <Minus className="h-4 w-4" />}
            <span className="font-semibold">{formatPercentage(value, showSign)}</span>
        </div>
    )
}

export const EquitiesDashboard = () => {
    const { getAssetsByType } = usePortfolioData()
    const equities = getAssetsByType('Equities')

    // Portfolio Metrics
    const totalValue = equities.reduce(
        (sum, equity) => sum + parseNumericValue(equity['Estimated asset value to date']),
        0
    )

    const totalCost = equities.reduce(
        (sum, equity) =>
            sum +
            parseNumericValue(
                equity['Total equity investment in asset (at cost) / Paid-in Capital']
            ),
        0
    )

    const totalReturn = totalValue - totalCost
    const returnPercentage = totalCost > 0 ? totalReturn / totalCost : 0

    // Top performers
    const topGainers = [...equities]
        .sort(
            (a, b) =>
                parseNumericValue(b['Total asset return to date']) -
                parseNumericValue(a['Total asset return to date'])
        )
        .slice(0, 5)

    const topLosers = [...equities]
        .sort(
            (a, b) =>
                parseNumericValue(a['Total asset return to date']) -
                parseNumericValue(b['Total asset return to date'])
        )
        .filter(e => parseNumericValue(e['Total asset return to date']) < 0)
        .slice(0, 5)

    const bestPerformer = topGainers[0]

    // Strategy/Sector Analysis (using Asset sub-group)
    const strategyAnalysis = equities.reduce(
        (acc, equity) => {
            const strategy = equity['Asset sub-group'] || 'General'
            if (!acc[strategy]) {
                acc[strategy] = {
                    name: strategy,
                    value: 0,
                    cost: 0,
                    count: 0,
                    totalReturn: 0,
                    returns: []
                }
            }
            const value = parseNumericValue(equity['Estimated asset value to date'])
            const cost = parseNumericValue(
                equity['Total equity investment in asset (at cost) / Paid-in Capital']
            )
            const returnPct = parseNumericValue(equity['Total asset return to date'])

            acc[strategy].value += value
            acc[strategy].cost += cost
            acc[strategy].count++
            acc[strategy].returns.push(returnPct)

            return acc
        },
        {} as Record<
            string,
            {
                name: string
                value: number
                cost: number
                count: number
                totalReturn: number
                returns: number[]
                avgReturn?: number
                returnPercentage?: number
            }
        >
    )

    // Calculate averages and percentages
    Object.values(strategyAnalysis).forEach(strategy => {
        strategy.totalReturn = strategy.value - strategy.cost
        strategy.returnPercentage = strategy.cost > 0 ? strategy.totalReturn / strategy.cost : 0
        strategy.avgReturn =
            strategy.returns.length > 0
                ? strategy.returns.reduce((sum, r) => sum + r, 0) / strategy.returns.length
                : 0
    })

    const strategyData = Object.values(strategyAnalysis)
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({
            ...item,
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Prepare pie chart data for strategy allocation - filter out strategies with no value
    const pieChartData = prepareChartData(
        strategyData
            .filter(item => item.value > 0) // Only include strategies with actual value
            .map((item, index) => ({
                name: truncateLabel(item.name, 20),
                fullName: item.name,
                value: item.value,
                count: item.count,
                fill: `var(--chart-${(index % 5) + 1})`
            })),
        { valueKey: 'value', includePercentage: true }
    )

    // Risk-Return Scatter Data
    const scatterData = equities.map(equity => ({
        x: parseNumericValue(
            equity['Total equity investment in asset (at cost) / Paid-in Capital']
        ),
        y: parseNumericValue(equity['Total asset return to date']) * 100,
        z: parseNumericValue(equity['Estimated asset value to date']),
        name: truncateLabel(equity['Asset name'], 20)
    }))

    // Broker Distribution
    const brokerDistribution = equities.reduce(
        (acc, equity) => {
            const broker = equity['Broker / Asset Manager'] || 'Unknown'
            if (!acc[broker]) {
                acc[broker] = { name: broker, value: 0, count: 0 }
            }
            acc[broker].value += parseNumericValue(equity['Estimated asset value to date'])
            acc[broker].count++
            return acc
        },
        {} as Record<string, { name: string; value: number; count: number }>
    )

    const brokerData = Object.values(brokerDistribution)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
        .map((item, index) => ({
            ...item,
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Holdings Concentration (top 10 by value)
    const topHoldings = [...equities]
        .sort(
            (a, b) =>
                parseNumericValue(b['Estimated asset value to date']) -
                parseNumericValue(a['Estimated asset value to date'])
        )
        .slice(0, 10)

    const concentrationData = topHoldings.slice(0, 5).map((equity, index) => ({
        name: truncateLabel(equity['Asset name'], 25),
        value: parseNumericValue(equity['Estimated asset value to date']),
        percentage: (parseNumericValue(equity['Estimated asset value to date']) / totalValue) * 100,
        fill: `var(--chart-${(index % 5) + 1})`
    }))

    // Investment Vintage Analysis
    const parseDate = (dateStr: string): number | null => {
        if (!dateStr || dateStr === '-' || dateStr.toLowerCase().includes('not available')) {
            return null
        }
        const date = new Date(dateStr)
        const year = date.getFullYear()
        if (year < 100) return 2000 + year
        if (!isNaN(year) && year > 2000 && year <= new Date().getFullYear()) {
            return year
        }
        return null
    }

    const vintageAnalysis = equities.reduce(
        (acc, equity) => {
            const year = parseDate(equity['Date of intial purchase/investment'])
            if (year) {
                const yearStr = year.toString()
                if (!acc[yearStr]) {
                    acc[yearStr] = { year: yearStr, invested: 0, currentValue: 0, count: 0 }
                }
                acc[yearStr].invested += parseNumericValue(
                    equity['Total equity investment in asset (at cost) / Paid-in Capital']
                )
                acc[yearStr].currentValue += parseNumericValue(
                    equity['Estimated asset value to date']
                )
                acc[yearStr].count++
            }
            return acc
        },
        {} as Record<
            string,
            { year: string; invested: number; currentValue: number; count: number }
        >
    )

    const vintageData = Object.values(vintageAnalysis)
        .sort((a, b) => parseInt(a.year) - parseInt(b.year))
        .slice(-5)
        .map(item => ({
            ...item,
            return: ((item.currentValue - item.invested) / item.invested) * 100
        }))

    // Performance by strategy for dual-bar chart - show both invested and current value
    const performanceChartData = strategyData
        .filter(item => item.value > 0 || item.cost > 0) // Include strategies with either value or cost
        .map(item => ({
            name: truncateLabel(item.name, 12),
            fullName: item.name,
            invested: item.cost,
            currentValue: item.value,
            return: item.returnPercentage ? item.returnPercentage * 100 : 0,
            assets: item.count,
            totalReturn: item.totalReturn
        }))

    return (
        <div className="space-y-6 p-6">
            {/* Executive Summary */}
            <Card className="from-card to-background bg-gradient-to-r">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold sm:text-2xl">
                                Equities Portfolio
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Stock holdings performance as of{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </CardDescription>
                        </div>
                        <div className="self-start sm:self-center">
                            <ChartThemeSelector />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Total Equity Value</p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(totalValue, 'EUR', true)}
                            </p>
                            <PerformanceIndicator value={returnPercentage} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Total Return</p>
                            <p
                                className={cn(
                                    'text-3xl font-bold',
                                    totalReturn >= 0 ? 'text-success' : 'text-destructive'
                                )}
                            >
                                {totalReturn >= 0 ? '+' : ''}
                                {formatCurrency(totalReturn, 'EUR', true)}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                on {formatCurrency(totalCost, 'EUR', true)} invested
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Best Performer</p>
                            <p className="truncate text-lg font-bold">
                                {bestPerformer?.['Asset name']?.substring(0, 25) || 'N/A'}
                            </p>
                            {bestPerformer && (
                                <p className="text-success text-xs">
                                    +
                                    {formatPercentage(
                                        parseNumericValue(
                                            bestPerformer['Total asset return to date']
                                        )
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Briefcase className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Total Positions</p>
                                <p className="text-2xl font-bold">{equities.length}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Across {strategyData.filter(s => s.value > 0).length} strategies
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <DollarSign className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Average Position Size</p>
                                <p className="text-2xl font-bold">
                                    {equities.length > 0
                                        ? formatCurrency(totalValue / equities.length, 'EUR', true)
                                        : 'N/A'}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">Per holding</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Globe className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Brokers</p>
                                <p className="text-2xl font-bold">{brokerData.length}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Management firms
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Row 1: Strategy Allocation & Performance */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Strategy Allocation Pie Chart */}
                <ChartCard
                    title="Strategy Allocation"
                    description="Portfolio distribution by investment strategy"
                    icon={PieChartIcon}
                    badge={<Badge variant="secondary">{pieChartData.length} strategies</Badge>}
                    data={pieChartData}
                    footer={
                        <InteractiveLegend items={pieChartData} columns={2} showPercentage={true} />
                    }
                >
                    <div className="flex min-h-[300px] flex-1 items-center justify-center">
                        <PieChart
                            data={pieChartData}
                            height="100%"
                            innerRadius={60}
                            outerRadius={120}
                        />
                    </div>
                </ChartCard>

                {/* Performance by Strategy - Dual Bar Chart */}
                <ChartCard
                    title="Strategy Performance"
                    description="Invested vs Current Value by strategy"
                    icon={BarChart3}
                    data={performanceChartData}
                    footer={
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-sm"
                                    style={{ backgroundColor: 'var(--chart-1)' }}
                                />
                                <span>Invested</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-sm"
                                    style={{ backgroundColor: 'var(--chart-5)' }}
                                />
                                <span>Current Value</span>
                            </div>
                        </div>
                    }
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={performanceChartData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={11}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={value => `€${(value / 1000000).toFixed(1)}M`}
                                    fontSize={11}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                    <p className="font-semibold">{data.fullName}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Invested:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.invested,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Current Value:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.currentValue,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Total Return:
                                                            </span>{' '}
                                                            <span
                                                                className={cn('font-medium', {
                                                                    'text-success':
                                                                        data.totalReturn > 0,
                                                                    'text-destructive':
                                                                        data.totalReturn < 0,
                                                                    'text-muted-foreground':
                                                                        data.totalReturn === 0
                                                                })}
                                                            >
                                                                {data.totalReturn >= 0 ? '+' : ''}
                                                                {formatCurrency(
                                                                    data.totalReturn,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                                {' ('}
                                                                {data.return >= 0 ? '+' : ''}
                                                                {data.return.toFixed(1)}%)
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Positions:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {data.assets}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="invested" fill="var(--chart-1)" radius={4} />
                                <Bar dataKey="currentValue" fill="var(--chart-5)" radius={4} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Charts Row 2: Risk Analysis & Investment Timeline */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Risk-Return Scatter Plot */}
                <ChartCard
                    title="Risk-Return Analysis"
                    description="Investment size vs returns"
                    data={scatterData}
                    footer={
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: 'var(--chart-2)' }}
                                />
                                <span>Profitable Position</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: 'var(--chart-5)' }}
                                />
                                <span>Loss Position</span>
                            </div>
                        </div>
                    }
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Investment"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={value => `€${(value / 1000).toFixed(0)}k`}
                                    fontSize={11}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Return %"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={value => `${value}%`}
                                    fontSize={11}
                                />
                                <ZAxis type="number" dataKey="z" range={[30, 5000]} name="Value" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                    <p className="font-semibold">{data.name}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Investment:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(data.x, 'EUR')}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Return:
                                                            </span>{' '}
                                                            <span
                                                                className={cn('font-medium', {
                                                                    'text-success': data.y > 0,
                                                                    'text-destructive': data.y < 0
                                                                })}
                                                            >
                                                                {data.y >= 0 ? '+' : ''}
                                                                {data.y.toFixed(1)}%
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Current Value:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(data.z, 'EUR')}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Scatter name="Equities" data={scatterData} fill="var(--chart-1)">
                                    {scatterData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.y >= 0 ? 'var(--chart-2)' : 'var(--chart-5)'
                                            }
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Investment Timeline */}
                <ChartCard
                    title="Investment Timeline"
                    description="Capital deployment by year (excludes positions without purchase dates)"
                    data={vintageData}
                    footer={
                        <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-1)' }}
                                    />
                                    <span>Invested</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-5)' }}
                                    />
                                    <span>Current Value</span>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Note: Chart shows only positions with purchase dates. Managed
                                portfolios without dates are excluded.
                            </p>
                        </div>
                    }
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={vintageData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="year"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={value => `€${(value / 1000000).toFixed(1)}M`}
                                    fontSize={11}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                    <p className="font-semibold">{data.year}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Invested:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.invested,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Current Value:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.currentValue,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Return:
                                                            </span>{' '}
                                                            <span
                                                                className={cn('font-medium', {
                                                                    'text-success': data.return > 0,
                                                                    'text-destructive':
                                                                        data.return < 0
                                                                })}
                                                            >
                                                                {data.return >= 0 ? '+' : ''}
                                                                {data.return.toFixed(1)}%
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Positions:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {data.count}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="invested"
                                    fill="var(--chart-1)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="currentValue"
                                    fill="var(--chart-5)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Top Performers and Losers */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Gainers */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Top Gainers</CardTitle>
                            <Badge variant="default">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                Best Performers
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topGainers.map((equity, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {equity['Asset name']}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {equity[
                                                'Asset ticker symbol, identification code or ISIN'
                                            ] || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {formatCurrency(
                                                parseNumericValue(
                                                    equity['Estimated asset value to date']
                                                ),
                                                'EUR'
                                            )}
                                        </p>
                                        <Badge variant="default" className="text-xs">
                                            +
                                            {formatPercentage(
                                                parseNumericValue(
                                                    equity['Total asset return to date']
                                                )
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Losers */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Top Losers</CardTitle>
                            <Badge variant="destructive">
                                <TrendingDown className="mr-1 h-3 w-3" />
                                Underperformers
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topLosers.length > 0 ? (
                                topLosers.map((equity, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {equity['Asset name']}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {equity[
                                                    'Asset ticker symbol, identification code or ISIN'
                                                ] || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        equity['Estimated asset value to date']
                                                    ),
                                                    'EUR'
                                                )}
                                            </p>
                                            <Badge variant="destructive" className="text-xs">
                                                {formatPercentage(
                                                    parseNumericValue(
                                                        equity['Total asset return to date']
                                                    )
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center">
                                    No losing positions
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Concentration & Brokers */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Portfolio Concentration */}
                <ChartCard
                    title="Portfolio Concentration"
                    description="Top 5 holdings by value"
                    data={concentrationData}
                >
                    <div className="space-y-4">
                        {concentrationData.map((holding, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: holding.fill }}
                                        />
                                        <span className="text-sm font-medium">{holding.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(holding.value, 'EUR', true)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {holding.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <Progress value={holding.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Broker Distribution */}
                <ChartCard
                    title="Broker Distribution"
                    description="Assets by management firm"
                    data={brokerData}
                >
                    <div className="space-y-4">
                        {brokerData.map((broker, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: broker.fill }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{broker.name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {broker.count}{' '}
                                            {broker.count === 1 ? 'position' : 'positions'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(broker.value, 'EUR', true)}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {((broker.value / totalValue) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Holdings Table */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Equity Holdings</CardTitle>
                            <CardDescription>Complete list of equity positions</CardDescription>
                        </div>
                        <Badge variant="outline">{equities.length} positions</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">Asset Name</TableHead>
                                    <TableHead className="font-semibold">Strategy</TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Shares
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Cost Basis
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Current Value
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Return
                                    </TableHead>
                                    <TableHead className="font-semibold">Broker</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topHoldings.map((equity, index) => {
                                    const returnValue = parseNumericValue(
                                        equity['Total asset return to date']
                                    )
                                    return (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div
                                                    className="max-w-[200px] truncate"
                                                    title={equity['Asset name']}
                                                >
                                                    {equity['Asset name']}
                                                </div>
                                                {equity[
                                                    'Asset ticker symbol, identification code or ISIN'
                                                ] &&
                                                    equity[
                                                        'Asset ticker symbol, identification code or ISIN'
                                                    ] !== 'Not available' && (
                                                        <span className="text-muted-foreground text-xs">
                                                            {
                                                                equity[
                                                                    'Asset ticker symbol, identification code or ISIN'
                                                                ]
                                                            }
                                                        </span>
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {truncateLabel(equity['Asset sub-group'], 20)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    parseNumericValue(
                                                        equity[
                                                            'Number of shares or units in the portfolio to date'
                                                        ]
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        equity[
                                                            'Total equity investment in asset (at cost) / Paid-in Capital'
                                                        ]
                                                    ),
                                                    'EUR'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        equity['Estimated asset value to date']
                                                    ),
                                                    'EUR'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PerformanceIndicator
                                                    value={returnValue}
                                                    showSign={true}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {equity['Broker / Asset Manager']}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
