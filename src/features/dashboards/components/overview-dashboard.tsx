'use client'

import { useRouter } from 'next/navigation'
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
import { ChartTooltip } from '@/components/ui/chart'
import {
    Bar,
    BarChart as RechartsBarChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Shield,
    Briefcase,
    AlertTriangle,
    Target,
    PieChart as PieChartIcon,
    BarChart3,
    Globe,
    ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { ChartThemeSelector } from './chart-theme-selector'
import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    getPerformanceTrend,
    parseNumericValue
} from '../utils/portfolio-utils'
import { ChartCard, InteractiveLegend, PieChart, RadarChart } from './charts'
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

const assetTypeRoutes: Record<string, string> = {
    'Structured notes': '/dashboards/structured-notes',
    Equities: '/dashboards/equities',
    'Alternative investments': '/dashboards/alternatives',
    Commodities: '/dashboards/commodities',
    BTC: '/dashboards/commodities',
    Gold: '/dashboards/commodities',
    Silver: '/dashboards/commodities',
    'Private Equity': '/dashboards/alternatives',
    'Private Equity Fund': '/dashboards/alternatives',
    'Private Equity direct ownership': '/dashboards/alternatives',
    'Private Debt': '/dashboards/alternatives',
    'Real Estate': '/dashboards/alternatives',
    'Hedge Funds': '/dashboards/alternatives',
    'Fund of Funds': '/dashboards/alternatives',
    'Fund of Search Funds': '/dashboards/alternatives',
    'Search Fund': '/dashboards/alternatives',
    'Housing development': '/dashboards/alternatives',
    Redevelopment: '/dashboards/alternatives',
    'Venture Capital & Crypto Assets Fund': '/dashboards/alternatives',
    'Venture Capital Fund': '/dashboards/alternatives',
    'Venture Capital startup': '/dashboards/alternatives',
    Bonds: '/dashboards/structured-notes',
    'Cash and Money Market Funds': '/dashboards/structured-notes'
}

const categoryRoutes: Record<string, string> = {
    'Structured Notes': '/dashboards/structured-notes',
    Equities: '/dashboards/equities',
    'Alternative Investments': '/dashboards/alternatives',
    Commodities: '/dashboards/commodities'
}

export const OverviewDashboardRefactored = () => {
    const router = useRouter()
    const {
        assets,
        portfolioMetrics,
        groupedAssetAllocation,
        groupedAssetTypeMetrics,
        topPerformers,
        brokerDistribution,
        currencyDistribution,
        riskMetrics
    } = usePortfolioData()

    const totalAssets = riskMetrics.totalAssetsCount

    const bestPerformer = topPerformers[0]

    // Prepare data for PieChart component
    const pieChartData = prepareChartData(
        groupedAssetAllocation.map((item, index) => ({
            name: item.assetType,
            fullName: item.assetType,
            value: item.value,
            count: item.count,
            route: categoryRoutes[item.assetType] || null,
            fill: `var(--chart-${(index % 5) + 1})`
        })),
        { valueKey: 'value', includePercentage: true }
    )

    // Prepare data for BarChart component
    const performanceChartData = groupedAssetTypeMetrics.map((item, index) => ({
        category: item.type,
        originalType: item.type,
        value: item.totalValue,
        totalReturn: item.totalReturn,
        return: item.returnPercentage * 100,
        assets: item.assetCount,
        avgReturn: item.averageReturn * 100,
        route: categoryRoutes[item.type] || null,
        fill: `var(--chart-${(index % 5) + 1})`
    }))

    // Investment Vintage Analysis - showing deployment over time by category
    const getInvestmentVintageData = () => {
        const vintageMap = new Map<
            string,
            {
                equities: number
                structuredNotes: number
                alternatives: number
                commodities: number
                total: number
                count: number
            }
        >()

        // Helper to categorize asset types
        const getCategoryFromType = (
            assetType: string
        ): 'equities' | 'structuredNotes' | 'alternatives' | 'commodities' => {
            const type = assetType.toLowerCase()
            if (type.includes('equit')) return 'equities'
            if (
                type.includes('structured') ||
                type.includes('bond') ||
                type.includes('cash') ||
                type.includes('money market')
            ) {
                return 'structuredNotes'
            }
            if (
                type.includes('commodit') ||
                type.includes('btc') ||
                type.includes('gold') ||
                type.includes('silver')
            ) {
                return 'commodities'
            }
            // Everything else is alternatives (private equity, private debt, real estate, etc.)
            return 'alternatives'
        }

        // Helper to parse various date formats (DD-Mon-YY, DD-Mon-YYYY)
        const parseDate = (dateStr: string): number | null => {
            if (!dateStr || dateStr === '-' || dateStr.toLowerCase().includes('not available')) {
                return null
            }

            // Try parsing the date string (handles formats like "27-Dec-23", "15-Jan-24")
            const date = new Date(dateStr)
            const year = date.getFullYear()

            // If year is 2-digit (like 23, 24), convert to 20XX
            if (year < 100) {
                return 2000 + year
            }

            // Validate the year is reasonable
            if (!isNaN(year) && year > 2000 && year <= new Date().getFullYear()) {
                return year
            }

            return null
        }

        // Use ALL assets from the portfolio, not just top performers
        assets.forEach(asset => {
            const dateStr = asset['Date of intial purchase/investment']
            const year = parseDate(dateStr)

            if (year) {
                const vintage = year.toString()
                const category = getCategoryFromType(asset['Asset type'])
                const amount = parseNumericValue(
                    asset['Total equity investment in asset (at cost) / Paid-in Capital']
                )

                const existing = vintageMap.get(vintage) || {
                    equities: 0,
                    structuredNotes: 0,
                    alternatives: 0,
                    commodities: 0,
                    total: 0,
                    count: 0
                }

                existing[category] += amount
                existing.total += amount
                existing.count += 1

                vintageMap.set(vintage, existing)
            }
        })

        // Get all years and sort them
        const sortedData = Array.from(vintageMap.entries()).sort(
            ([a], [b]) => parseInt(a) - parseInt(b)
        )

        // If we have data, return it; otherwise return empty array
        if (sortedData.length === 0) {
            return []
        }

        // Take last 5 years or all data if less than 5
        const dataToShow = sortedData.slice(-5)

        return dataToShow.map(([year, data]) => ({
            year,
            Equities: data.equities,
            'Structured Notes': data.structuredNotes,
            Alternatives: data.alternatives,
            Commodities: data.commodities,
            total: data.total,
            assets: data.count
        }))
    }

    const investmentVintageData = getInvestmentVintageData()

    // Top holdings table data
    const topHoldingsData = topPerformers.slice(0, 10).map(asset => ({
        name: asset['Asset name'],
        type: asset['Asset type'],
        value: formatCurrency(parseNumericValue(asset['Estimated asset value to date']), 'EUR'),
        cost: formatCurrency(
            parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            ),
            'EUR'
        ),
        return: parseFloat(String(asset['Total asset return to date']).replace('%', '')) || 0,
        broker: asset['Broker / Asset Manager'],
        status: asset['Asset status']
    }))

    // Currency exposure data
    const totalCurrencyValue = Array.from(currencyDistribution.values()).reduce(
        (sum, val) => sum + val,
        0
    )
    const currencyData = Array.from(currencyDistribution.entries())
        .map(([currency, value], index) => ({
            name: currency,
            value: value,
            percentage: (value / totalCurrencyValue) * 100,
            fill: `var(--chart-${(index % 5) + 1})`
        }))
        .sort((a, b) => b.value - a.value)

    // Broker concentration data
    const hasBrokerData = brokerDistribution && brokerDistribution.size > 0
    const brokerData = hasBrokerData
        ? Array.from(brokerDistribution.entries())
              .map(([broker, assets], index) => {
                  const value = assets.reduce((sum, asset) => {
                      return sum + parseNumericValue(asset['Estimated asset value to date'])
                  }, 0)
                  return {
                      name: truncateLabel(broker, 15),
                      value: value,
                      count: assets.length,
                      percentage: 0,
                      fill: `var(--chart-${(index % 5) + 1})`
                  }
              })
              .filter(b => b.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
        : []

    const totalBrokerValue = brokerData.reduce((sum, b) => sum + b.value, 0)
    brokerData.forEach(
        b => (b.percentage = totalBrokerValue > 0 ? (b.value / totalBrokerValue) * 100 : 0)
    )

    return (
        <div className="space-y-6 p-6">
            {/* Executive Summary Section */}
            <Card className="from-card to-background bg-gradient-to-r">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Executive Summary</CardTitle>
                            <CardDescription className="mt-2">
                                Portfolio performance snapshot as of{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </CardDescription>
                        </div>
                        <ChartThemeSelector />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Total Portfolio Value</p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(portfolioMetrics.totalValue, 'EUR', true)}
                            </p>
                            <PerformanceIndicator value={portfolioMetrics.returnPercentage} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Year-to-Date Return</p>
                            <p
                                className={cn(
                                    'text-3xl font-bold',
                                    portfolioMetrics.totalReturn >= 0
                                        ? 'text-success'
                                        : 'text-destructive'
                                )}
                            >
                                {portfolioMetrics.totalReturn >= 0 ? '+' : ''}
                                {formatCurrency(portfolioMetrics.totalReturn, 'EUR', true)}
                            </p>
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        portfolioMetrics.returnPercentage >= 0
                                            ? 'text-success'
                                            : 'text-destructive'
                                    )}
                                >
                                    {portfolioMetrics.returnPercentage >= 0 ? '+' : ''}
                                    {formatPercentage(portfolioMetrics.returnPercentage)}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    on {formatCurrency(portfolioMetrics.totalCost, 'EUR', true)}{' '}
                                    invested
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Asset Categories</p>
                            <p className="text-3xl font-bold">{groupedAssetAllocation.length}</p>
                            <div className="flex items-center gap-2">
                                <Shield className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground text-xs">
                                    Diversified portfolio
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Active Positions</p>
                            <p className="text-3xl font-bold">{riskMetrics.activeAssetsCount}</p>
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                <Briefcase className="h-4 w-4" />
                                <span>{totalAssets} total assets</span>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {bestPerformer && (
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <div className="bg-muted rounded-full p-2">
                                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Top Performing Asset</p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {bestPerformer['Asset name']?.substring(0, 40)}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold">
                                        Return:{' '}
                                        {formatPercentage(
                                            parseFloat(
                                                String(
                                                    bestPerformer['Total asset return to date']
                                                ).replace('%', '')
                                            ) / 100 || 0,
                                            true
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {riskMetrics.leveragedAssetsCount > 0 && (
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <div className="bg-muted rounded-full p-2">
                                    <AlertTriangle className="text-muted-foreground h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Leveraged Positions</p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {formatNumber(riskMetrics.leveragedAssetsCount)} assets with
                                        financing
                                    </p>
                                    <p className="mt-1 text-xs font-semibold">
                                        Total:{' '}
                                        {formatCurrency(riskMetrics.totalLeverage, 'EUR', true)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {riskMetrics.pendingInvestments > 0 && (
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <div className="bg-muted rounded-full p-2">
                                    <Target className="text-muted-foreground h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Pending Investments</p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Unfunded commitments
                                    </p>
                                    <p className="mt-1 text-xs font-semibold">
                                        Amount:{' '}
                                        {formatCurrency(
                                            riskMetrics.pendingInvestments,
                                            'EUR',
                                            true
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Asset Allocation & Performance Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Asset Allocation Pie Chart */}
                <ChartCard
                    title="Asset Allocation"
                    description="Portfolio composition by asset class"
                    icon={PieChartIcon}
                    badge={
                        <Badge variant="secondary">
                            {groupedAssetAllocation.length} categories
                        </Badge>
                    }
                    data={pieChartData}
                    footer={
                        <InteractiveLegend
                            items={pieChartData.map(item => ({
                                ...item,
                                onClick: item.route
                                    ? () => router.push(item.route as string)
                                    : undefined
                            }))}
                            columns={2}
                            showPercentage={true}
                        />
                    }
                >
                    <div className="flex min-h-[300px] flex-1 items-center justify-center">
                        <PieChart
                            data={pieChartData}
                            height="100%"
                            innerRadius={60}
                            outerRadius={120}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onSliceClick={(data: any) => {
                                if (data?.route) router.push(data.route as string)
                            }}
                        />
                    </div>
                </ChartCard>

                {/* Performance by Asset Type */}
                <ChartCard
                    title="Performance Analysis"
                    description="Actual returns by asset category"
                    icon={BarChart3}
                    badge={<Badge variant="secondary">To Date</Badge>}
                    data={performanceChartData}
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={performanceChartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="category"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={value => `${value}%`}
                                    fontSize={11}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                    <p className="font-semibold">
                                                        {data.originalType}
                                                    </p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Total Value:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.value,
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
                                                                        data.return < 0,
                                                                    'text-muted-foreground':
                                                                        data.return === 0
                                                                })}
                                                            >
                                                                {data.totalReturn >= 0 ? '+' : ''}
                                                                {formatCurrency(
                                                                    data.totalReturn,
                                                                    'EUR',
                                                                    true
                                                                )}{' '}
                                                                ({data.return >= 0 ? '+' : ''}
                                                                {data.return.toFixed(1)}%)
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Avg Return:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {data.avgReturn.toFixed(1)}%
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Assets:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {data.assets}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <p className="text-primary mt-2 flex items-center gap-1 text-xs">
                                                        <ExternalLink className="h-3 w-3" />
                                                        Click to view details
                                                    </p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    dataKey="return"
                                    radius={[4, 4, 0, 0]}
                                    onClick={data => {
                                        if (data.route) router.push(data.route)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {performanceChartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`var(--chart-${(index % 5) + 1})`}
                                        />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Investment Analysis */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Investment Vintage Analysis */}
                <ChartCard
                    title="Investment Vintage Analysis"
                    description="Capital deployment by category over time"
                    data={investmentVintageData}
                    className="lg:col-span-2"
                    badge={
                        <Badge variant="secondary">
                            {investmentVintageData.reduce((sum, d) => sum + d.assets, 0)} assets
                        </Badge>
                    }
                    footer={
                        <div className="space-y-3">
                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-1)' }}
                                    />
                                    <span className="text-sm">Equities</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-2)' }}
                                    />
                                    <span className="text-sm">Structured Notes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-3)' }}
                                    />
                                    <span className="text-sm">Alternatives</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-sm"
                                        style={{ backgroundColor: 'var(--chart-4)' }}
                                    />
                                    <span className="text-sm">Commodities</span>
                                </div>
                            </div>
                            {/* Total Investment */}
                            <div className="space-y-2 border-t pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        Total Investment Shown
                                    </span>
                                    <span className="text-sm font-bold">
                                        {formatCurrency(
                                            investmentVintageData.reduce(
                                                (sum, d) => sum + d.total,
                                                0
                                            ),
                                            'EUR',
                                            true
                                        )}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Note: Only includes assets with valid purchase dates (
                                    {investmentVintageData.reduce((sum, d) => sum + d.assets, 0)} of{' '}
                                    {assets.length} total assets)
                                </p>
                            </div>
                        </div>
                    }
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={investmentVintageData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="year"
                                    tickLine={false}
                                    axisLine={false}
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
                                                    <p className="font-semibold">{data.year}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Total Investment:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    data.total,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </span>
                                                        </p>
                                                        {data.Equities > 0 && (
                                                            <p className="text-sm">
                                                                <span className="text-muted-foreground">
                                                                    Equities:
                                                                </span>{' '}
                                                                {formatCurrency(
                                                                    data.Equities,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </p>
                                                        )}
                                                        {data['Structured Notes'] > 0 && (
                                                            <p className="text-sm">
                                                                <span className="text-muted-foreground">
                                                                    Structured Notes:
                                                                </span>{' '}
                                                                {formatCurrency(
                                                                    data['Structured Notes'],
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </p>
                                                        )}
                                                        {data.Alternatives > 0 && (
                                                            <p className="text-sm">
                                                                <span className="text-muted-foreground">
                                                                    Alternatives:
                                                                </span>{' '}
                                                                {formatCurrency(
                                                                    data.Alternatives,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </p>
                                                        )}
                                                        {data.Commodities > 0 && (
                                                            <p className="text-sm">
                                                                <span className="text-muted-foreground">
                                                                    Commodities:
                                                                </span>{' '}
                                                                {formatCurrency(
                                                                    data.Commodities,
                                                                    'EUR',
                                                                    true
                                                                )}
                                                            </p>
                                                        )}
                                                        <p className="text-sm font-medium">
                                                            Assets purchased: {data.assets}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="Equities" stackId="a" fill="var(--chart-1)" />
                                <Bar dataKey="Structured Notes" stackId="a" fill="var(--chart-2)" />
                                <Bar dataKey="Alternatives" stackId="a" fill="var(--chart-3)" />
                                <Bar dataKey="Commodities" stackId="a" fill="var(--chart-4)" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Currency Exposure */}
                <ChartCard
                    title="Currency Exposure"
                    description="Portfolio distribution by currency"
                    icon={Globe}
                    data={currencyData}
                >
                    <div className="space-y-4">
                        {currencyData.map((currency, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: currency.fill }}
                                        />
                                        <span className="font-medium">{currency.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatCurrency(currency.value, 'EUR', true)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {currency.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <Progress value={currency.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Bottom Section - Top Holdings and Broker Concentration */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Holdings Table */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Top Holdings</CardTitle>
                                <CardDescription>Largest positions by value</CardDescription>
                            </div>
                            <Badge variant="outline">Top 10</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Asset Name</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Current Value
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Cost Basis
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Return
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topHoldingsData.map((holding, index) => (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/30 cursor-pointer transition-colors"
                                            onClick={() => {
                                                const route = assetTypeRoutes[holding.type]
                                                if (route) router.push(route)
                                            }}
                                        >
                                            <TableCell className="font-medium">
                                                <div
                                                    className="max-w-[200px] truncate"
                                                    title={holding.name}
                                                >
                                                    {holding.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {holding.type.replace('Investment', '').trim()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {holding.value}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-right">
                                                {holding.cost}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PerformanceIndicator
                                                    value={holding.return / 100}
                                                    showSign={true}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        holding.status === 'Active in portfolio'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {holding.status === 'Active in portfolio'
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Broker Concentration - Radar Chart */}
                <ChartCard
                    title="Broker Concentration"
                    description={`Portfolio distribution across ${brokerData.length} management firms`}
                    data={brokerData}
                    footer={
                        brokerData.length > 0 && (
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 font-medium">
                                    Top broker: {brokerData[0]?.name} (
                                    {brokerData[0]?.percentage.toFixed(1)}%)
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2">
                                    Total managed value:{' '}
                                    {formatCurrency(totalBrokerValue, 'EUR', true)}
                                </div>
                            </div>
                        )
                    }
                >
                    {brokerData.length > 0 ? (
                        <div className="min-h-[300px] flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                    data={brokerData}
                                    dataKey="percentage"
                                    angleKey="name"
                                    height="100%"
                                />
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex min-h-[300px] flex-1 items-center justify-center">
                            <p className="text-muted-foreground">No broker data available</p>
                        </div>
                    )}
                </ChartCard>
            </div>
        </div>
    )
}
