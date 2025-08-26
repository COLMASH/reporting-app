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
    Bitcoin,
    Shield,
    Package,
    BarChart3,
    PieChart as PieChartIcon,
    Wallet,
    Globe
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
import { PortfolioAsset } from '../types/portfolio'

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

export const CommoditiesDashboard = () => {
    const { assets } = usePortfolioData()

    // Helper function to calculate asset value
    const getAssetValue = (asset: PortfolioAsset) => {
        const estimatedValue = parseNumericValue(asset['Estimated asset value to date'])

        // If estimated value is empty or 0, calculate from shares × price
        if (!estimatedValue || estimatedValue === 0) {
            const shares = parseNumericValue(
                asset['Number of shares or units in the portfolio to date']
            )
            const currentPrice = parseNumericValue(asset['Current price per share or unit'])
            return shares * currentPrice
        }

        return estimatedValue
    }

    // Helper function to calculate asset return
    const getAssetReturn = (asset: PortfolioAsset) => {
        // First check if there's a pre-calculated return
        const returnStr = asset['Total asset return to date']
        if (returnStr && returnStr !== '' && returnStr !== '-') {
            return parseNumericValue(returnStr)
        }

        // If no pre-calculated return, calculate from value vs cost
        const value = getAssetValue(asset)
        const cost = parseNumericValue(
            asset['Total equity investment in asset (at cost) / Paid-in Capital']
        )

        if (cost > 0) {
            return (value - cost) / cost
        }

        return 0
    }

    // Get all commodities (Gold, Silver, BTC)
    const allCommodities = assets.filter(
        asset =>
            asset['Asset type'] === 'Gold' ||
            asset['Asset type'] === 'Silver' ||
            asset['Asset type'] === 'BTC'
    )

    // Get commodities by type
    const gold = allCommodities.filter(asset => asset['Asset type'] === 'Gold')
    const silver = allCommodities.filter(asset => asset['Asset type'] === 'Silver')
    const btc = allCommodities.filter(asset => asset['Asset type'] === 'BTC')

    // Portfolio Metrics
    const totalValue = allCommodities.reduce((sum, asset) => sum + getAssetValue(asset), 0)

    const totalCost = allCommodities.reduce(
        (sum, asset) =>
            sum +
            parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            ),
        0
    )

    const totalReturn = totalValue - totalCost
    const returnPercentage = totalCost > 0 ? totalReturn / totalCost : 0

    // Best performer
    const bestPerformer = [...allCommodities]
        .sort((a, b) => getAssetReturn(b) - getAssetReturn(a))
        .filter(a => getAssetReturn(a) > 0)[0]

    // Commodity Type Analysis
    const commodityTypeData = [
        {
            name: 'Gold',
            fullName: 'Gold Holdings',
            value: gold.reduce((sum, a) => sum + getAssetValue(a), 0),
            cost: gold.reduce(
                (sum, a) =>
                    sum +
                    parseNumericValue(
                        a['Total equity investment in asset (at cost) / Paid-in Capital']
                    ),
                0
            ),
            count: gold.length,
            avgReturn:
                gold.length > 0
                    ? gold.reduce((sum, a) => sum + getAssetReturn(a), 0) / gold.length
                    : 0
        },
        {
            name: 'Silver',
            fullName: 'Silver Holdings',
            value: silver.reduce((sum, a) => sum + getAssetValue(a), 0),
            cost: silver.reduce(
                (sum, a) =>
                    sum +
                    parseNumericValue(
                        a['Total equity investment in asset (at cost) / Paid-in Capital']
                    ),
                0
            ),
            count: silver.length,
            avgReturn:
                silver.length > 0
                    ? silver.reduce((sum, a) => sum + getAssetReturn(a), 0) / silver.length
                    : 0
        },
        {
            name: 'Bitcoin',
            fullName: 'Bitcoin Holdings',
            value: btc.reduce((sum, a) => sum + getAssetValue(a), 0),
            cost: btc.reduce(
                (sum, a) =>
                    sum +
                    parseNumericValue(
                        a['Total equity investment in asset (at cost) / Paid-in Capital']
                    ),
                0
            ),
            count: btc.length,
            avgReturn:
                btc.length > 0 ? btc.reduce((sum, a) => sum + getAssetReturn(a), 0) / btc.length : 0
        }
    ]
        .filter(c => c.value > 0)
        .map((item, index) => ({
            ...item,
            totalReturn: item.value - item.cost,
            returnPercentage: item.cost > 0 ? (item.value - item.cost) / item.cost : 0,
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Prepare pie chart data
    const pieChartData = prepareChartData(
        commodityTypeData.map((item, index) => ({
            name: item.name,
            fullName: item.fullName,
            value: item.value,
            count: item.count,
            fill: `var(--chart-${(index % 5) + 1})`
        })),
        { valueKey: 'value', includePercentage: true }
    )

    // Custody/Storage Analysis
    const custodyAnalysis = allCommodities.reduce(
        (acc, asset) => {
            const broker = asset['Broker / Asset Manager'] || 'Unknown'
            if (!acc[broker]) {
                acc[broker] = {
                    name: broker,
                    value: 0,
                    cost: 0,
                    count: 0,
                    assets: []
                }
            }
            acc[broker].value += getAssetValue(asset)
            acc[broker].cost += parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            )
            acc[broker].count++
            acc[broker].assets.push(asset['Asset type'])
            return acc
        },
        {} as Record<
            string,
            { name: string; value: number; cost: number; count: number; assets: string[] }
        >
    )

    const custodyData = Object.values(custodyAnalysis)
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({
            ...item,
            name: truncateLabel(item.name, 15),
            fullName: item.name,
            percentage: (item.value / totalValue) * 100,
            returnPercentage: item.cost > 0 ? (item.value - item.cost) / item.cost : 0,
            dominantAsset: item.assets[0],
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Performance Comparison Chart Data
    const performanceComparisonData = commodityTypeData.map(item => ({
        name: item.name,
        invested: item.cost,
        currentValue: item.value,
        return: item.returnPercentage * 100,
        positions: item.count
    }))

    // Currency Exposure
    const currencyExposure = allCommodities.reduce(
        (acc, asset) => {
            const currency = asset['Denomination currency of asset and cashflow'] || 'EUR'
            if (!acc[currency]) {
                acc[currency] = { currency, value: 0, count: 0 }
            }
            acc[currency].value += getAssetValue(asset)
            acc[currency].count++
            return acc
        },
        {} as Record<string, { currency: string; value: number; count: number }>
    )

    const currencyData = Object.values(currencyExposure)
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({
            ...item,
            percentage: (item.value / totalValue) * 100,
            fill: `var(--chart-${(index % 5) + 1})`
        }))

    // Risk-Return Scatter Data
    const scatterData = allCommodities
        .filter(asset => getAssetValue(asset) > 0)
        .map(asset => ({
            x: parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            ),
            y: getAssetReturn(asset) * 100,
            z: getAssetValue(asset),
            name: truncateLabel(asset['Asset name'], 25),
            type: asset['Asset type']
        }))

    // Top holdings for table
    const topHoldings = [...allCommodities]
        .sort((a, b) => {
            const valueA = getAssetValue(a)
            const valueB = getAssetValue(b)
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
                                Commodities Portfolio
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Precious metals and digital assets as of{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                <span className="text-muted-foreground mt-1 block text-xs">
                                    Includes: Physical Gold, Gold ETFs, Silver, and Bitcoin
                                </span>
                            </CardDescription>
                        </div>
                        <div className="self-start sm:self-center">
                            <ChartThemeSelector />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Total Commodity Value</p>
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
                            <p className="text-muted-foreground text-sm">Active Positions</p>
                            <p className="text-3xl font-bold">{allCommodities.length}</p>
                            <div className="flex items-center gap-2">
                                <Package className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground text-xs">
                                    {commodityTypeData.length} commodity types
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Best Performer</p>
                            <p className="truncate text-lg font-bold">
                                {bestPerformer?.['Asset name']?.substring(0, 25) || 'N/A'}
                            </p>
                            {bestPerformer && (
                                <p className="text-success text-xs">
                                    +{formatPercentage(getAssetReturn(bestPerformer))}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Shield className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Gold Holdings</p>
                                <p className="text-2xl font-bold">{gold.length}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {formatCurrency(
                                        gold.reduce((sum, a) => sum + getAssetValue(a), 0),
                                        'EUR',
                                        true
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Bitcoin className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Bitcoin Holdings</p>
                                <p className="text-2xl font-bold">
                                    {btc
                                        .reduce(
                                            (sum, a) =>
                                                sum +
                                                parseNumericValue(
                                                    a[
                                                        'Number of shares or units in the portfolio to date'
                                                    ]
                                                ),
                                            0
                                        )
                                        .toFixed(2)}{' '}
                                    BTC
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {formatCurrency(
                                        btc.reduce((sum, a) => sum + getAssetValue(a), 0),
                                        'EUR',
                                        true
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="bg-muted rounded-full p-2">
                                <Wallet className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Storage Providers</p>
                                <p className="text-2xl font-bold">{custodyData.length}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Across banks & cold wallets
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Allocation Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Commodity Type Allocation */}
                <ChartCard
                    title="Commodity Allocation"
                    description="Portfolio distribution by commodity type"
                    icon={PieChartIcon}
                    badge={<Badge variant="secondary">{commodityTypeData.length} types</Badge>}
                    data={pieChartData}
                    footer={
                        <InteractiveLegend items={pieChartData} columns={3} showPercentage={true} />
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

                {/* Performance by Commodity */}
                <ChartCard
                    title="Performance by Commodity"
                    description="Invested capital vs current value comparison"
                    icon={BarChart3}
                    data={performanceComparisonData}
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
                            <RechartsBarChart data={performanceComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="name"
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
                                                    <p className="font-semibold">{data.name}</p>
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
                                                                {data.positions}
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

            {/* Risk Analysis */}
            <ChartCard
                title="Risk-Return Analysis"
                description="Investment size vs returns for individual positions"
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
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Investment"
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
                                                            Investment:
                                                        </span>{' '}
                                                        <span className="font-medium">
                                                            {formatCurrency(data.x, 'EUR', true)}
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
                                                            {formatCurrency(data.z, 'EUR', true)}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Scatter name="Commodities" data={scatterData} fill="var(--chart-1)">
                                {scatterData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.y >= 0 ? 'var(--chart-2)' : 'var(--chart-5)'}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>

            {/* Custody & Currency Analysis */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Custody/Storage Analysis */}
                <ChartCard
                    title="Custody & Storage Analysis"
                    description="Assets by storage provider"
                    icon={Wallet}
                    data={custodyData}
                >
                    <div className="space-y-4">
                        {custodyData.slice(0, 6).map((custody, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: custody.fill }}
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            title={custody.fullName}
                                        >
                                            {custody.name}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {custody.dominantAsset}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(custody.value, 'EUR', true)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {custody.percentage.toFixed(1)}% • {custody.count}{' '}
                                            {custody.count === 1 ? 'asset' : 'assets'}
                                        </p>
                                    </div>
                                </div>
                                <Progress value={custody.percentage} className="h-2" />
                            </div>
                        ))}
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
                                        <span className="font-medium">{currency.currency}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatCurrency(currency.value, 'EUR', true)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {currency.percentage.toFixed(1)}% • {currency.count}{' '}
                                            positions
                                        </p>
                                    </div>
                                </div>
                                <Progress value={currency.percentage} className="h-2" />
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
                            <CardTitle>Commodity Holdings</CardTitle>
                            <CardDescription>
                                Detailed view of all commodity positions
                            </CardDescription>
                        </div>
                        <Badge variant="outline">{allCommodities.length} positions</Badge>
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
                                        Quantity
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
                                    <TableHead className="font-semibold">Custody</TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Currency
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topHoldings.map((asset, index) => {
                                    const returnValue = getAssetReturn(asset)
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
                                                    {asset['Asset type']}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    parseNumericValue(
                                                        asset[
                                                            'Number of shares or units in the portfolio to date'
                                                        ]
                                                    )
                                                )}
                                                {asset['Asset type'] === 'BTC' && (
                                                    <span className="text-muted-foreground ml-1 text-xs">
                                                        BTC
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        asset[
                                                            'Total equity investment in asset (at cost) / Paid-in Capital'
                                                        ]
                                                    ),
                                                    'EUR'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(getAssetValue(asset), 'EUR')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PerformanceIndicator
                                                    value={returnValue}
                                                    showSign={true}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {truncateLabel(
                                                    asset['Broker / Asset Manager'] || 'Unknown',
                                                    20
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="text-xs">
                                                    {asset[
                                                        'Denomination currency of asset and cashflow'
                                                    ] || 'EUR'}
                                                </Badge>
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
