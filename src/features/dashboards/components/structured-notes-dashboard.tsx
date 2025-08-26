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
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts'
import { ChartTooltip } from '@/components/ui/chart'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { ChartThemeSelector } from './chart-theme-selector'
import {
    formatCurrency,
    formatPercentage,
    parseNumericValue,
    getPerformanceTrend
} from '../utils/portfolio-utils'
import { ChartCard } from './charts'
import { truncateLabel } from './charts/utils'

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

export const StructuredNotesDashboard = () => {
    const { assets } = usePortfolioData()

    // Get all assets that belong to the "Structured Notes" category
    // This includes: Structured notes, Bonds, and Cash and Money Market Funds
    const structuredNotes = assets.filter(asset => {
        const assetType = asset['Asset type']
        return (
            assetType === 'Structured notes' ||
            assetType === 'Bonds' ||
            assetType === 'Cash and Money Market Funds'
        )
    })

    // Portfolio Metrics
    const totalValue = structuredNotes.reduce(
        (sum, note) => sum + parseNumericValue(note['Estimated asset value to date']),
        0
    )

    const totalCost = structuredNotes.reduce(
        (sum, note) =>
            sum +
            parseNumericValue(note['Total equity investment in asset (at cost) / Paid-in Capital']),
        0
    )

    // Calculate returns - use actual value difference since this includes bonds and cash
    const totalReturn = totalValue - totalCost
    const returnPercentage = totalCost > 0 ? totalReturn / totalCost : 0

    // Maturity Timeline
    const maturityTimelineData = structuredNotes
        .filter(note => note['Final due date of Structured Note'])
        .reduce(
            (acc, note) => {
                const dateStr = note['Final due date of Structured Note']
                if (!dateStr) return acc

                const dueDate = new Date(dateStr)
                if (isNaN(dueDate.getTime())) return acc

                const year = dueDate.getFullYear()

                if (!acc[year]) {
                    acc[year] = {
                        year: year.toString(),
                        count: 0,
                        value: 0,
                        avgCoupon: 0,
                        coupons: [] as number[]
                    }
                }

                acc[year].count++
                acc[year].value += parseNumericValue(note['Estimated asset value to date'])
                acc[year].coupons.push(parseNumericValue(note['Annual coupon of Structured Note']))

                return acc
            },
            {} as Record<
                number,
                { year: string; count: number; value: number; avgCoupon: number; coupons: number[] }
            >
        )

    Object.values(maturityTimelineData).forEach(item => {
        item.avgCoupon = (item.coupons.reduce((a, b) => a + b, 0) / item.coupons.length) * 100
        // Clear coupons array after calculation
        item.coupons = []
    })

    const maturityData = Object.values(maturityTimelineData)
        .sort((a, b) => parseInt(a.year) - parseInt(b.year))
        .slice(0, 10)

    // Underlying Assets with Coupons
    const underlyingAssetsData = structuredNotes.reduce(
        (acc, note) => {
            const underlying = note['Structured Note underlying index or asset basket - name']
            if (!underlying || underlying === '-') return acc

            const key = underlying.length > 40 ? underlying.substring(0, 40) + '...' : underlying

            if (!acc[key]) {
                acc[key] = {
                    name: truncateLabel(key, 25),
                    fullName: underlying,
                    value: 0,
                    count: 0,
                    totalCoupon: 0,
                    avgCoupon: 0
                }
            }

            const noteValue = parseNumericValue(note['Estimated asset value to date'])
            const noteCoupon = parseNumericValue(note['Annual coupon of Structured Note'])

            acc[key].value += noteValue
            acc[key].count++
            acc[key].totalCoupon += noteCoupon

            return acc
        },
        {} as Record<
            string,
            {
                name: string
                fullName: string
                value: number
                count: number
                totalCoupon: number
                avgCoupon: number
            }
        >
    )

    // Calculate average coupon for each underlying
    Object.values(underlyingAssetsData).forEach(item => {
        item.avgCoupon = item.count > 0 ? (item.totalCoupon / item.count) * 100 : 0
    })

    const underlyingData = Object.values(underlyingAssetsData)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)

    // Top Holdings
    const topHoldings = structuredNotes
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
                                Structured Notes Portfolio
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Products as of{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                <span className="text-muted-foreground mt-1 block text-xs">
                                    Includes: Structured Notes, Bonds, and Cash & Money Market Funds
                                </span>
                            </CardDescription>
                        </div>
                        <div className="self-start sm:self-center">
                            <ChartThemeSelector />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Portfolio Value</p>
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
                            <p className="text-muted-foreground text-sm">Active Notes</p>
                            <p className="text-3xl font-bold">{structuredNotes.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Maturity Timeline */}
                <ChartCard
                    title="Maturity Timeline"
                    description="Value distribution by maturity year"
                    icon={Calendar}
                    badge={<Badge variant="secondary">{maturityData.length} years</Badge>}
                    data={maturityData}
                >
                    <div className="min-h-[300px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={maturityData}>
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
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
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
                                                    <p className="font-semibold">{data.year}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Maturing Value:
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
                                                                Notes Count:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {data.count}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">
                                                                Avg Coupon:
                                                            </span>{' '}
                                                            <span className="font-medium">
                                                                {data.avgCoupon.toFixed(1)}%
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
                                    dataKey="value"
                                    fill="var(--chart-1)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="avgCoupon"
                                    stroke="var(--chart-3)"
                                    strokeWidth={2}
                                    dot={{ fill: 'var(--chart-3)', r: 4 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Underlying Assets Exposure */}
                <ChartCard
                    title="Underlying Assets & Coupons"
                    description="Index exposure with average yields"
                    data={underlyingData}
                >
                    <div className="space-y-4">
                        {underlyingData.map((asset, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: `var(--chart-${(index % 5) + 1})`
                                            }}
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            title={asset.fullName}
                                        >
                                            {asset.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(asset.value, 'EUR', true)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {asset.avgCoupon.toFixed(1)}% avg coupon
                                        </p>
                                    </div>
                                </div>
                                <Progress
                                    value={(asset.value / totalValue) * 100}
                                    className="h-2"
                                />
                                <div className="text-muted-foreground flex justify-between text-xs">
                                    <span>
                                        {asset.count} {asset.count === 1 ? 'note' : 'notes'}
                                    </span>
                                    <span>{((asset.value / totalValue) * 100).toFixed(1)}%</span>
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
                            <CardTitle>Structured Notes Holdings</CardTitle>
                            <CardDescription>
                                Detailed view of all structured products
                            </CardDescription>
                        </div>
                        <Badge variant="outline">{structuredNotes.length} notes</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">Note Name</TableHead>
                                    <TableHead className="font-semibold">ISIN</TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Current Value
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Coupon
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Performance
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Maturity
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topHoldings.map((note, index) => {
                                    const returnValue =
                                        parseFloat(
                                            String(note['Total asset return to date']).replace(
                                                '%',
                                                ''
                                            )
                                        ) || 0

                                    return (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div
                                                    className="max-w-[200px] truncate"
                                                    title={note['Asset name']}
                                                >
                                                    {note['Asset name']}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs">
                                                    {
                                                        note[
                                                            'Asset ticker symbol, identification code or ISIN'
                                                        ]
                                                    }
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(
                                                    parseNumericValue(
                                                        note['Estimated asset value to date']
                                                    ),
                                                    'EUR'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">
                                                    {formatPercentage(
                                                        parseNumericValue(
                                                            note['Annual coupon of Structured Note']
                                                        )
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PerformanceIndicator
                                                    value={returnValue / 100}
                                                    showSign={true}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center text-xs">
                                                {note['Final due date of Structured Note'] || 'N/A'}
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
