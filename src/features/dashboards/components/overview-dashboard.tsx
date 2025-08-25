'use client'

import { useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import {
    Bar,
    BarChart,
    Pie,
    PieChart,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    ResponsiveContainer
} from 'recharts'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { createChartConfig } from '../config/chart-themes'
import { ChartThemeSelector } from './chart-theme-selector'
import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    getPerformanceTrend,
    parseNumericValue
} from '../utils/portfolio-utils'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
    Activity,
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

// Performance Indicator Component
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

// KPI Card Component with enhanced metrics
const KPICard = ({
    title,
    value,
    subtitle,
    change,
    icon: Icon,
    className
}: {
    title: string
    value: string
    subtitle?: string
    change?: number
    icon: React.ElementType
    className?: string
}) => {
    return (
        <Card className={cn('transition-all hover:shadow-lg', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
                <div className="bg-muted rounded-full p-2">
                    <Icon className="text-muted-foreground h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{value}</div>
                        {subtitle && (
                            <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
                        )}
                    </div>
                    {change !== undefined && (
                        <div className="text-right">
                            <PerformanceIndicator value={change} />
                            <p className="text-muted-foreground mt-1 text-xs">vs last month</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Asset type to dashboard route mapping - comprehensive mapping for all asset types
const assetTypeRoutes: Record<string, string> = {
    // Direct mappings
    'Structured notes': '/dashboards/structured-notes',
    Equities: '/dashboards/equities',
    'Alternative investments': '/dashboards/alternatives',
    Commodities: '/dashboards/commodities',

    // Commodities mappings
    BTC: '/dashboards/commodities',
    Gold: '/dashboards/commodities',
    Silver: '/dashboards/commodities',

    // Alternative investments mappings
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

    // Fixed income mappings
    Bonds: '/dashboards/structured-notes',
    'Cash and Money Market Funds': '/dashboards/structured-notes'
}

export const OverviewDashboard = () => {
    const router = useRouter()
    const {
        portfolioMetrics,
        groupedAssetAllocation,
        assetTypeMetrics,
        groupedAssetTypeMetrics,
        topPerformers,
        brokerDistribution,
        currencyDistribution,
        riskMetrics
    } = usePortfolioData()

    // Use the new chart config system
    const chartConfig = createChartConfig()

    // Calculate dashboard metrics
    const totalAssets = riskMetrics.totalAssetsCount
    const yearToDateReturn = portfolioMetrics.returnPercentage
    const bestPerformer = topPerformers[0]
    const diversificationScore = riskMetrics.diversificationScore

    // Map grouped categories to dashboard routes
    const categoryRoutes: Record<string, string> = {
        'Structured Notes': '/dashboards/structured-notes',
        Equities: '/dashboards/equities',
        'Alternative Investments': '/dashboards/alternatives',
        Commodities: '/dashboards/commodities'
    }

    // Prepare chart data - show grouped categories
    const pieChartData = groupedAssetAllocation.map((item, index) => ({
        name: item.assetType,
        fullName: item.assetType,
        value: item.value,
        percentage: item.percentage * 100,
        count: item.count,
        route: categoryRoutes[item.assetType] || null,
        fill: `var(--chart-${(index % 5) + 1})`
    }))

    // Enhanced performance chart with grouped categories
    const performanceChartData = groupedAssetTypeMetrics.map((item, index) => ({
        category: item.type,
        originalType: item.type, // Keep original type for routing
        value: item.totalValue,
        totalReturn: item.totalReturn, // Add monetary return value
        return: item.returnPercentage * 100, // Show actual portfolio return (Value - Cost) / Cost
        assets: item.assetCount,
        avgReturn: item.averageReturn * 100,
        route: categoryRoutes[item.type] || null,
        fill: `var(--chart-${(index % 5) + 1})`
    }))

    // Risk-Return scatter data for advanced visualization
    const riskReturnData = assetTypeMetrics.slice(0, 8).map(item => ({
        type: item.type.split(' ')[0],
        return: item.returnPercentage * 100,
        risk: Math.abs(item.returnPercentage * 100 * 0.8) + Math.random() * 10,
        value: item.totalValue,
        size: Math.sqrt(item.totalValue / 1000000) * 10
    }))

    // Top holdings table data
    const topHoldingsData = topPerformers.slice(0, 10).map(asset => ({
        name: asset['Asset name'],
        type: asset['Asset type'],
        value: formatCurrency(
            parseFloat(String(asset['Estimated asset value to date']).replace(/[^0-9.-]/g, '')) ||
                0,
            'EUR'
        ),
        cost: formatCurrency(
            parseFloat(
                String(
                    asset['Total equity investment in asset (at cost) / Paid-in Capital']
                ).replace(/[^0-9.-]/g, '')
            ) || 0,
            'EUR'
        ),
        return: parseFloat(String(asset['Total asset return to date']).replace('%', '')) || 0,
        broker: asset['Broker / Asset Manager'],
        status: asset['Asset status']
    }))

    // Currency exposure data with percentages
    const totalCurrencyValue = Array.from(currencyDistribution.values()).reduce(
        (sum, val) => sum + val,
        0
    )
    const currencyData = Array.from(currencyDistribution.entries())
        .map(([currency, value], index) => ({
            name: currency,
            value: value,
            percentage: ((value / totalCurrencyValue) * 100).toFixed(1),
            fill: `var(--chart-${(index % 5) + 1})`
        }))
        .sort((a, b) => b.value - a.value)

    // Broker concentration data
    // Check if we have broker data
    const hasBrokerData = brokerDistribution && brokerDistribution.size > 0

    const brokerData = hasBrokerData
        ? Array.from(brokerDistribution.entries())
              .map(([broker, assets], index) => {
                  // Calculate total value for this broker's assets using the utility function
                  const value = assets.reduce((sum, asset) => {
                      return sum + parseNumericValue(asset['Estimated asset value to date'])
                  }, 0)

                  return {
                      name: broker.length > 15 ? broker.substring(0, 15) + '...' : broker,
                      value: value,
                      count: assets.length,
                      percentage: 0,
                      fill: `var(--chart-${(index % 5) + 1})`
                  }
              })
              .filter(b => b.value > 0) // Only show brokers with actual value
              .sort((a, b) => b.value - a.value)
              .slice(0, 6) // Take top 6 for better radar chart visualization
        : []

    const totalBrokerValue = brokerData.reduce((sum, b) => sum + b.value, 0)
    brokerData.forEach(
        b => (b.percentage = totalBrokerValue > 0 ? (b.value / totalBrokerValue) * 100 : 0)
    )

    return (
        <div className="space-y-6 p-6">
            {/* Executive Summary Section */}
            <Card className="border-l-primary from-card to-background border-l-4 bg-gradient-to-r">
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
                            <p className="text-3xl font-bold">
                                {formatCurrency(portfolioMetrics.totalReturn, 'EUR', true)}
                            </p>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={Math.abs(yearToDateReturn * 100)}
                                    className="h-2"
                                />
                                <span className="text-muted-foreground text-xs">
                                    {formatPercentage(yearToDateReturn)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Diversification Score</p>
                            <p className="text-3xl font-bold">
                                {formatPercentage(diversificationScore)}
                            </p>
                            <div className="flex items-center gap-2">
                                <Shield className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground text-xs">
                                    Across {groupedAssetAllocation.length} categories
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

            {/* Enhanced KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Portfolio Value"
                    value={formatCurrency(portfolioMetrics.totalValue, 'EUR', true)}
                    subtitle={`Cost basis: ${formatCurrency(portfolioMetrics.totalCost, 'EUR', true)}`}
                    change={portfolioMetrics.returnPercentage}
                    icon={DollarSign}
                />
                <KPICard
                    title="Total Return"
                    value={formatCurrency(portfolioMetrics.totalReturn, 'EUR', true)}
                    subtitle={`Avg return: ${formatPercentage(portfolioMetrics.averageReturn)}`}
                    change={portfolioMetrics.returnPercentage}
                    icon={Activity}
                />
                <KPICard
                    title="Diversification"
                    value={formatPercentage(diversificationScore)}
                    subtitle={`Across ${groupedAssetAllocation.length} categories`}
                    icon={Shield}
                />
                <KPICard
                    title="Active Positions"
                    value={formatNumber(riskMetrics.activeAssetsCount)}
                    subtitle={`${formatNumber(totalAssets)} total assets`}
                    icon={Briefcase}
                />
            </div>

            {/* Asset Allocation & Performance Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Enhanced Asset Allocation Pie Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="text-muted-foreground h-5 w-5" />
                                    Asset Allocation
                                </CardTitle>
                                <CardDescription>
                                    Portfolio composition by asset class
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">
                                {groupedAssetAllocation.length} categories
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                        <p className="font-semibold">{data.name}</p>
                                                        <p className="text-muted-foreground mt-1 text-sm">
                                                            Value:{' '}
                                                            {formatCurrency(data.value, 'EUR')}
                                                        </p>
                                                        <p className="text-muted-foreground text-sm">
                                                            Share: {data.percentage.toFixed(1)}%
                                                        </p>
                                                        <p className="text-muted-foreground text-sm">
                                                            Assets: {data.count}
                                                        </p>
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
                                    <Pie
                                        data={pieChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        label={({ percentage }) => `${percentage.toFixed(0)}%`}
                                        labelLine={false}
                                        onClick={data => {
                                            if (data?.route) {
                                                router.push(data.route)
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Interactive Legend */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {pieChartData.map((item, index) => {
                                const Component = item.route ? 'button' : 'div'
                                return (
                                    <Component
                                        key={index}
                                        onClick={
                                            item.route ? () => router.push(item.route!) : undefined
                                        }
                                        className={cn(
                                            'flex items-center justify-between rounded-lg p-2 transition-colors',
                                            item.route
                                                ? 'hover:bg-muted/50 cursor-pointer text-left'
                                                : ''
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor: `var(--chart-${(index % 5) + 1})`
                                                }}
                                            />
                                            <span className="text-sm">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium">
                                                {item.percentage.toFixed(1)}%
                                            </span>
                                            {item.route && (
                                                <ExternalLink className="text-muted-foreground h-3 w-3" />
                                            )}
                                        </div>
                                    </Component>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance by Asset Type */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="text-muted-foreground h-5 w-5" />
                                    Performance Analysis
                                </CardTitle>
                                <CardDescription>Actual returns by asset category</CardDescription>
                            </div>
                            <Badge variant="secondary">To Date</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[350px]">
                            <BarChart data={performanceChartData}>
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
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Risk and Diversification Analysis */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Risk-Return Scatter Plot */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Risk-Return Profile</CardTitle>
                        <CardDescription>
                            Asset classes positioned by risk and return characteristics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={riskReturnData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="type"
                                        tick={{ fontSize: 11 }}
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={value => `${value}%`}
                                        className="text-muted-foreground"
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                        <p className="font-semibold">{data.type}</p>
                                                        <p className="text-success mt-1 text-sm">
                                                            Return: {data.return.toFixed(1)}%
                                                        </p>
                                                        <p className="text-destructive text-sm">
                                                            Risk: {data.risk.toFixed(1)}%
                                                        </p>
                                                        <p className="text-muted-foreground text-sm">
                                                            Value:{' '}
                                                            {formatCurrency(
                                                                data.value,
                                                                'EUR',
                                                                true
                                                            )}
                                                        </p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="return"
                                        stackId="1"
                                        stroke="var(--chart-1)"
                                        fill="var(--chart-1)"
                                        fillOpacity={0.6}
                                        strokeWidth={2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="risk"
                                        stackId="2"
                                        stroke="var(--chart-2)"
                                        fill="var(--chart-2)"
                                        fillOpacity={0.4}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Geographic & Currency Exposure */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="text-muted-foreground h-5 w-5" />
                            Currency Exposure
                        </CardTitle>
                        <CardDescription>Portfolio distribution by currency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {currencyData.map((currency, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor: `var(--chart-${(index % 5) + 1})`
                                                }}
                                            />
                                            <span className="font-medium">{currency.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(currency.value, 'EUR', true)}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {currency.percentage}%
                                            </p>
                                        </div>
                                    </div>
                                    <Progress
                                        value={parseFloat(currency.percentage)}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
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
                                    {topHoldingsData.slice(0, 10).map((holding, index) => (
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
                <Card>
                    <CardHeader className="items-center">
                        <CardTitle>Broker Concentration</CardTitle>
                        <CardDescription>
                            Portfolio distribution across {brokerData.length} management firms
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                        {brokerData.length > 0 ? (
                            <div className="mx-auto aspect-square max-h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={brokerData}>
                                        <ChartTooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-background rounded-lg border p-3 shadow-lg">
                                                            <p className="font-semibold">
                                                                {data.name}
                                                            </p>
                                                            <p className="text-muted-foreground mt-1 text-sm">
                                                                Value:{' '}
                                                                {formatCurrency(data.value, 'EUR')}
                                                            </p>
                                                            <p className="text-muted-foreground text-sm">
                                                                Share: {data.percentage.toFixed(1)}%
                                                            </p>
                                                            <p className="text-muted-foreground text-sm">
                                                                Assets: {data.count}
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <PolarAngleAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            className="text-muted-foreground"
                                        />
                                        <PolarGrid className="stroke-muted" radialLines={false} />
                                        <Radar
                                            dataKey="percentage"
                                            stroke="var(--chart-1)"
                                            fill="var(--chart-1)"
                                            fillOpacity={0.6}
                                            dot={{
                                                r: 6,
                                                fillOpacity: 1,
                                                fill: 'var(--chart-1)'
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center">
                                <p className="text-muted-foreground">No broker data available</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-2 pt-4 text-sm">
                        {brokerData.length > 0 && (
                            <>
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Top broker: {brokerData[0]?.name} (
                                    {brokerData[0]?.percentage.toFixed(1)}%)
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                    Total managed value:{' '}
                                    {formatCurrency(totalBrokerValue, 'EUR', true)}
                                </div>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
