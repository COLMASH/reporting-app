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
    Briefcase,
    DollarSign,
    AlertTriangle,
    PieChart as PieChartIcon,
    BarChart3,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { ChartThemeSelector } from './chart-theme-selector'
import {
    formatCurrency,
    formatPercentage,
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

export const AlternativeInvestmentsDashboard = () => {
    const { assets } = usePortfolioData()

    // Get all assets that belong to the "Alternative Investments" category
    const alternatives = assets.filter(asset => {
        const assetType = asset['Asset type']
        return (
            assetType === 'Private Equity Fund' ||
            assetType === 'Private Equity direct ownership' ||
            assetType === 'Private Debt' ||
            assetType === 'Real Estate' ||
            assetType === 'Hedge Funds' ||
            assetType === 'Fund of Funds' ||
            assetType === 'Fund of Search Funds' ||
            assetType === 'Search Fund' ||
            assetType === 'Housing development' ||
            assetType === 'Redevelopment' ||
            assetType === 'Venture Capital & Crypto Assets Fund' ||
            assetType === 'Venture Capital Fund' ||
            assetType === 'Venture Capital startup'
        )
    })

    // Portfolio Metrics
    const totalValue = alternatives.reduce(
        (sum, asset) => sum + parseNumericValue(asset['Estimated asset value to date']),
        0
    )

    const totalCost = alternatives.reduce(
        (sum, asset) =>
            sum +
            parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            ),
        0
    )

    const unfundedCommitment = alternatives.reduce(
        (sum, asset) => sum + parseNumericValue(asset['Pending investment / Unfunded Commitment']),
        0
    )

    const totalReturn = totalValue - totalCost
    const returnPercentage = totalCost > 0 ? totalReturn / totalCost : 0

    // Calculate DPI and TVPI multiples
    const totalDistributions = alternatives.reduce((sum, asset) => {
        const distributions = parseNumericValue(asset['Distributions to date'])
        return sum + distributions
    }, 0)

    // Strategy Analysis - Group by category
    const strategyAnalysis = alternatives.reduce(
        (acc, asset) => {
            let strategy = 'Other'
            const assetType = asset['Asset type']

            if (assetType.includes('Private Equity')) strategy = 'Private Equity'
            else if (assetType.includes('Venture Capital')) strategy = 'Venture Capital'
            else if (
                assetType === 'Real Estate' ||
                assetType === 'Housing development' ||
                assetType === 'Redevelopment'
            )
                strategy = 'Real Estate'
            else if (assetType === 'Hedge Funds') strategy = 'Hedge Funds'
            else if (assetType.includes('Search Fund')) strategy = 'Search Funds'
            else if (assetType === 'Private Debt') strategy = 'Private Debt'
            else if (assetType === 'Fund of Funds') strategy = 'Fund of Funds'

            if (!acc[strategy]) {
                acc[strategy] = {
                    name: strategy,
                    value: 0,
                    cost: 0,
                    commitment: 0,
                    unfunded: 0,
                    count: 0,
                    totalReturn: 0,
                    distributions: 0
                }
            }

            const value = parseNumericValue(asset['Estimated asset value to date'])
            const cost = parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            )
            const commitment = parseNumericValue(asset['Total investment commitment'])
            const unfunded = parseNumericValue(asset['Pending investment / Unfunded Commitment'])
            const distributions = parseNumericValue(asset['Distributions to date'])

            acc[strategy].value += value
            acc[strategy].cost += cost
            acc[strategy].commitment += commitment
            acc[strategy].unfunded += unfunded
            acc[strategy].count++
            acc[strategy].distributions += distributions
            acc[strategy].totalReturn = acc[strategy].value - acc[strategy].cost

            return acc
        },
        {} as Record<
            string,
            {
                name: string
                value: number
                cost: number
                commitment: number
                unfunded: number
                count: number
                totalReturn: number
                distributions: number
            }
        >
    )

    const strategyData = Object.values(strategyAnalysis)
        .filter(s => s.value > 0 || s.commitment > 0)
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({
            ...item,
            returnPercentage: item.cost > 0 ? item.totalReturn / item.cost : 0,
            deploymentRate: item.commitment > 0 ? item.cost / item.commitment : 0,
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Prepare pie chart data for strategy allocation - filter out strategies with no value
    const pieChartData = prepareChartData(
        strategyData
            .filter(item => item.value > 0) // Only include strategies with actual value
            .map((item, index) => ({
                name: item.name,
                fullName: item.name,
                value: item.value,
                count: item.count,
                fill: `var(--chart-${(index % 5) + 1})`
            })),
        { valueKey: 'value', includePercentage: true }
    )

    // Top performers
    const topPerformers = [...alternatives]
        .sort((a, b) => {
            const returnA = parseNumericValue(a['Total asset return to date'])
            const returnB = parseNumericValue(b['Total asset return to date'])
            return returnB - returnA
        })
        .slice(0, 5)

    // Underperformers - get bottom 5 performers (including positive returns if needed)
    const underperformers = [...alternatives]
        .sort((a, b) => {
            const returnA = parseNumericValue(a['Total asset return to date'])
            const returnB = parseNumericValue(b['Total asset return to date'])
            return returnA - returnB
        })
        .slice(0, 5)

    // Fund Manager Analysis
    const managerAnalysis = alternatives.reduce(
        (acc, asset) => {
            const manager = asset['Broker / Asset Manager'] || 'Self-Managed'
            if (!acc[manager]) {
                acc[manager] = { name: manager, value: 0, commitment: 0, count: 0 }
            }
            acc[manager].value += parseNumericValue(asset['Estimated asset value to date'])
            acc[manager].commitment += parseNumericValue(asset['Total investment commitment'])
            acc[manager].count++
            return acc
        },
        {} as Record<string, { name: string; value: number; commitment: number; count: number }>
    )

    const managerData = Object.values(managerAnalysis)
        .filter(m => m.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .map((item, index) => ({
            ...item,
            name: truncateLabel(item.name, 15),
            fullName: item.name,
            percentage: (item.value / totalValue) * 100,
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Capital Deployment Waterfall
    const deploymentData = strategyData.map(strategy => ({
        name: truncateLabel(strategy.name, 12),
        fullName: strategy.name,
        commitment: strategy.commitment,
        deployed: strategy.cost,
        unfunded: strategy.unfunded,
        deploymentRate: strategy.deploymentRate * 100,
        count: strategy.count
    }))

    // Risk-Return Scatter Data
    const scatterData = alternatives
        .filter(asset => parseNumericValue(asset['Total investment commitment']) > 0)
        .map(asset => ({
            x: parseNumericValue(asset['Total investment commitment']),
            y: parseNumericValue(asset['Total asset return to date']) * 100,
            z: parseNumericValue(asset['Estimated asset value to date']),
            name: truncateLabel(asset['Asset name'], 30),
            type: asset['Asset type']
        }))

    // Top holdings for table
    const topHoldings = [...alternatives]
        .sort((a, b) => {
            const valueA = parseNumericValue(a['Estimated asset value to date'])
            const valueB = parseNumericValue(b['Estimated asset value to date'])
            return valueB - valueA
        })
        .slice(0, 10)

    return (
        <div className="space-y-6 p-6">
            {/* Executive Summary */}
            <Card className="from-card to-background bg-gradient-to-r">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold sm:text-2xl">
                                Alternative Investments Portfolio
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Private markets and alternative strategies as of{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                <span className="text-muted-foreground mt-1 block text-xs">
                                    Includes: PE, VC, Real Estate, Hedge Funds, and Search Funds
                                </span>
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
                            <p className="text-muted-foreground text-sm">Total NAV</p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(totalValue, 'EUR', true)}
                            </p>
                            <PerformanceIndicator value={returnPercentage} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Total Return</p>
                            <p className="text-3xl font-bold">
                                <span
                                    className={cn(
                                        totalValue - totalCost >= 0
                                            ? 'text-success'
                                            : 'text-destructive'
                                    )}
                                >
                                    {totalValue - totalCost >= 0 ? '+' : ''}
                                    {formatCurrency(totalValue - totalCost, 'EUR', true)}
                                </span>
                            </p>
                            <p className="text-muted-foreground text-sm">
                                on {formatCurrency(totalCost, 'EUR', true)} invested
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Unfunded</p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(unfundedCommitment, 'EUR', true)}
                            </p>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground text-xs">
                                    Future capital calls
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Briefcase className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Active Investments</p>
                                <p className="text-2xl font-bold">{alternatives.length}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Across {strategyData.length} strategies
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <DollarSign className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Total Distributions</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(totalDistributions, 'EUR', true)}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Cash returned to date
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Users className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Fund Managers</p>
                                <p className="text-2xl font-bold">
                                    {Object.keys(managerAnalysis).length}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    GP relationships
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Strategy Allocation & Capital Deployment */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Strategy Allocation Pie Chart */}
                <ChartCard
                    title="Strategy Allocation"
                    description="Portfolio distribution by alternative investment strategy"
                    icon={PieChartIcon}
                    badge={<Badge variant="secondary">{strategyData.length} strategies</Badge>}
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

                {/* Capital Deployment by Strategy */}
                <ChartCard
                    title="Capital Deployment Status"
                    description="Committed capital vs actual deployment by strategy"
                    icon={BarChart3}
                    data={deploymentData}
                    footer={
                        <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-1)' }}
                                    />
                                    <span>Total Commitment</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-5)' }}
                                    />
                                    <span>Deployed (Paid-In)</span>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Bars show deployment progress. Higher deployment rates indicate
                                efficient capital use.
                            </p>
                        </div>
                    }
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={deploymentData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
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
                                                                Total Commitment:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.commitment,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Deployed (Paid-In):
                                                            </span>{' '}
                                                            <span className="text-success font-medium">
                                                                {formatCurrency(
                                                                    data.deployed,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Remaining Unfunded:
                                                            </span>{' '}
                                                            <span className="text-warning font-medium">
                                                                {formatCurrency(
                                                                    data.unfunded,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        <div className="mt-2 border-t pt-2">
                                                            <p className="text-sm font-semibold">
                                                                <span className="text-muted-foreground">
                                                                    Deployment Progress:
                                                                </span>{' '}
                                                                <span
                                                                    className={cn(
                                                                        data.deploymentRate > 75
                                                                            ? 'text-success'
                                                                            : data.deploymentRate >
                                                                                50
                                                                              ? 'text-warning'
                                                                              : 'text-destructive'
                                                                    )}
                                                                >
                                                                    {data.deploymentRate.toFixed(1)}
                                                                    %
                                                                </span>
                                                            </p>
                                                            <Progress
                                                                value={data.deploymentRate}
                                                                className="mt-1 h-1.5"
                                                            />
                                                        </div>
                                                        <p className="text-muted-foreground text-xs">
                                                            {data.count}{' '}
                                                            {data.count === 1
                                                                ? 'investment'
                                                                : 'investments'}{' '}
                                                            in this strategy
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="commitment" fill="var(--chart-1)" radius={4} />
                                <Bar dataKey="deployed" fill="var(--chart-5)" radius={4} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Risk Analysis & Fund Manager Concentration */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Risk-Return Scatter Plot */}
                <ChartCard
                    title="Risk-Return Analysis"
                    description="Commitment size vs returns"
                    data={scatterData}
                    footer={
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: 'var(--chart-2)' }}
                                />
                                <span>Profitable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: 'var(--chart-5)' }}
                                />
                                <span>Loss</span>
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
                                    name="Commitment"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={value => `€${(value / 1000000).toFixed(1)}M`}
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
                                                    <p className="text-muted-foreground text-xs">
                                                        {data.type}
                                                    </p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Commitment:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.x,
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
                                                                {formatCurrency(
                                                                    data.z,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Scatter
                                    name="Alternatives"
                                    data={scatterData}
                                    fill="var(--chart-1)"
                                >
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

                {/* Fund Manager Concentration */}
                <ChartCard
                    title="Fund Manager Concentration"
                    description={`Showing top 6 of ${Object.keys(managerAnalysis).length} managers`}
                    data={managerData}
                >
                    <div className="space-y-4">
                        {managerData.slice(0, 6).map((manager, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: manager.fill }}
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            title={manager.fullName}
                                        >
                                            {manager.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(manager.value, 'EUR', true)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {manager.percentage.toFixed(1)}% • {manager.count}{' '}
                                            {manager.count === 1 ? 'investment' : 'investments'}
                                        </p>
                                    </div>
                                </div>
                                <Progress value={manager.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Top Performers & Top Losers */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Performers */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Top Performers</CardTitle>
                            <Badge variant="default">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                Best Returns
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topPerformers.map((asset, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {asset['Asset name']}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {asset['Asset type']}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {formatCurrency(
                                                parseNumericValue(
                                                    asset['Estimated asset value to date']
                                                ),
                                                'EUR'
                                            )}
                                        </p>
                                        <Badge variant="default" className="text-xs">
                                            +
                                            {formatPercentage(
                                                parseNumericValue(
                                                    asset['Total asset return to date']
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
                            {underperformers.length > 0 ? (
                                underperformers.map((asset, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {asset['Asset name']}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {asset['Asset type']}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        asset['Estimated asset value to date']
                                                    ),
                                                    'EUR'
                                                )}
                                            </p>
                                            <Badge
                                                variant={
                                                    parseNumericValue(
                                                        asset['Total asset return to date']
                                                    ) >= 0
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="text-xs"
                                            >
                                                {parseNumericValue(
                                                    asset['Total asset return to date']
                                                ) > 0
                                                    ? '+'
                                                    : ''}
                                                {formatPercentage(
                                                    parseNumericValue(
                                                        asset['Total asset return to date']
                                                    )
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground flex items-center justify-center py-8">
                                    No underperforming investments
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Holdings Table */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Alternative Investment Holdings</CardTitle>
                            <CardDescription>
                                Complete list of alternative investment positions
                            </CardDescription>
                        </div>
                        <Badge variant="outline">{alternatives.length} investments</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">Investment Name</TableHead>
                                    <TableHead className="font-semibold">Type</TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Commitment
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Paid-In
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">NAV</TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Distributions
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        TVPI
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Return
                                    </TableHead>
                                    <TableHead className="font-semibold">Manager</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topHoldings.map((asset, index) => {
                                    const paidIn = parseNumericValue(
                                        asset[
                                            'Total equity investment in asset (at cost) / Paid-in Capital'
                                        ]
                                    )
                                    const currentValue = parseNumericValue(
                                        asset['Estimated asset value to date']
                                    )
                                    const distributions = parseNumericValue(
                                        asset['Distributions to date']
                                    )
                                    const tvpi =
                                        paidIn > 0 ? (currentValue + distributions) / paidIn : 0

                                    return (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div
                                                    className="max-w-[200px] truncate"
                                                    title={asset['Asset name']}
                                                >
                                                    {asset['Asset name']}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {truncateLabel(asset['Asset type'], 20)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        asset['Total investment commitment']
                                                    ),
                                                    'EUR'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(paidIn, 'EUR')}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(currentValue, 'EUR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(distributions, 'EUR')}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {tvpi.toFixed(2)}x
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PerformanceIndicator
                                                    value={parseNumericValue(
                                                        asset['Total asset return to date']
                                                    )}
                                                    showSign={true}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {truncateLabel(
                                                    asset['Broker / Asset Manager'] ||
                                                        'Self-Managed',
                                                    15
                                                )}
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
