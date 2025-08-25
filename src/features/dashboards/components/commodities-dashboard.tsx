'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { defaultChartConfig } from '../config/chart-config'
import { formatCurrency, formatPercentage, parseNumericValue } from '../utils/portfolio-utils'
import { Coins, TrendingUp, Shield, Bitcoin } from 'lucide-react'

// Safe color cycling - CSS only defines 5 chart colors
const MAX_CHART_COLORS = 5

const getChartColor = (index: number): string => {
    const colorNumber = (index % MAX_CHART_COLORS) + 1
    return `var(--chart-${colorNumber})`
}

export const CommoditiesDashboard = () => {
    const { getAssetsByType } = usePortfolioData()

    const gold = getAssetsByType('Gold')
    const silver = getAssetsByType('Silver')
    const btc = getAssetsByType('BTC')

    const allCommodities = [...gold, ...silver, ...btc]

    const totalValue = allCommodities.reduce(
        (sum, asset) => sum + parseNumericValue(asset['Estimated asset value to date']),
        0
    )

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

    const commodityAllocation = [
        {
            name: 'Gold',
            value: gold.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: gold.length,
            avgReturn:
                gold.reduce(
                    (sum, a) => sum + parseNumericValue(a['Total asset return to date']),
                    0
                ) / Math.max(gold.length, 1),
            fill: getChartColor(0)
        },
        {
            name: 'Silver',
            value: silver.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: silver.length,
            avgReturn:
                silver.reduce(
                    (sum, a) => sum + parseNumericValue(a['Total asset return to date']),
                    0
                ) / Math.max(silver.length, 1),
            fill: getChartColor(1)
        },
        {
            name: 'Bitcoin',
            value: btc.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: btc.length,
            avgReturn:
                btc.reduce(
                    (sum, a) => sum + parseNumericValue(a['Total asset return to date']),
                    0
                ) / Math.max(btc.length, 1),
            fill: getChartColor(2)
        }
    ].filter(c => c.value > 0)

    const performanceComparison = commodityAllocation.map((commodity, index) => ({
        name: commodity.name,
        value: commodity.value,
        return: commodity.avgReturn * 100,
        allocation: (commodity.value / totalValue) * 100,
        fill: getChartColor(index)
    }))

    const brokerDistribution = allCommodities.reduce(
        (acc, asset) => {
            const broker = asset['Broker / Asset Manager'] || 'Unknown'
            if (!acc[broker]) acc[broker] = { name: broker, value: 0, count: 0 }
            acc[broker].value += parseNumericValue(asset['Estimated asset value to date'])
            acc[broker].count++
            return acc
        },
        {} as Record<string, { name: string; value: number; count: number }>
    )

    const brokerData = Object.values(brokerDistribution).map((item, index) => ({
        ...item,
        fill: getChartColor(index)
    }))

    const topCommodityReturns = commodityAllocation
        .sort((a, b) => b.avgReturn - a.avgReturn)
        .map((commodity, index) => ({
            name: commodity.name,
            value: commodity.avgReturn * 100,
            fill: getChartColor(index)
        }))

    const detailedPerformance = allCommodities
        .map((asset, index) => ({
            name: asset['Asset name'].substring(0, 30),
            type: asset['Asset type'],
            value: parseNumericValue(asset['Estimated asset value to date']),
            return: parseNumericValue(asset['Total asset return to date']) * 100,
            fill: getChartColor(index)
        }))
        .sort((a, b) => b.value - a.value)

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Commodities Value
                        </CardTitle>
                        <Coins className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                        <p className="text-muted-foreground text-xs">
                            {allCommodities.length} positions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReturn)}</div>
                        <p
                            className={`text-xs ${returnPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                        >
                            {formatPercentage(returnPercentage)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gold Holdings</CardTitle>
                        <Shield className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{gold.length}</div>
                        <p className="text-muted-foreground text-xs">
                            {formatCurrency(
                                gold.reduce(
                                    (sum, a) =>
                                        sum + parseNumericValue(a['Estimated asset value to date']),
                                    0
                                )
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bitcoin Holdings</CardTitle>
                        <Bitcoin className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{btc.length}</div>
                        <p className="text-muted-foreground text-xs">
                            {formatCurrency(
                                btc.reduce(
                                    (sum, a) =>
                                        sum + parseNumericValue(a['Estimated asset value to date']),
                                    0
                                )
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Commodity Allocation</CardTitle>
                        <CardDescription>Distribution by commodity type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <PieChart>
                                <Pie
                                    data={commodityAllocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {commodityAllocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={value => formatCurrency(Number(value))}
                                        />
                                    }
                                />
                            </PieChart>
                        </ChartContainer>
                        <div className="mt-4 space-y-2">
                            {commodityAllocation.map(item => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: item.fill
                                            }}
                                        />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium">
                                            {formatCurrency(item.value)}
                                        </span>
                                        <span className="text-muted-foreground ml-2 text-xs">
                                            ({item.count} positions)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Comparison</CardTitle>
                        <CardDescription>Returns by commodity type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <BarChart data={performanceComparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => {
                                                if (name === 'return' || name === 'allocation')
                                                    return `${Number(value).toFixed(1)}%`
                                                return formatCurrency(Number(value))
                                            }}
                                        />
                                    }
                                />
                                <defs>
                                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-violet)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-violet)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-blue)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-blue)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="allocationGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-cyan)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-cyan)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <Bar
                                    dataKey="value"
                                    fill="url(#valueGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="return"
                                    fill="url(#returnGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="allocation"
                                    fill="url(#allocationGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Average Returns by Commodity</CardTitle>
                        <CardDescription>Performance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <BarChart data={topCommodityReturns}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={value => `${Number(value).toFixed(1)}%`}
                                        />
                                    }
                                />
                                <defs>
                                    <linearGradient
                                        id="returnsGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-emerald)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-emerald)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <Bar
                                    dataKey="value"
                                    fill="url(#returnsGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                        <div className="mt-4 space-y-2">
                            {topCommodityReturns.map(item => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: item.fill }}
                                        />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {item.value.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Broker Distribution</CardTitle>
                        <CardDescription>Commodities by management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <LineChart data={brokerData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={value => formatCurrency(Number(value))}
                                        />
                                    }
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--color-amber)"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Individual Performance</CardTitle>
                    <CardDescription>Detailed commodity positions</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={defaultChartConfig} className="h-[300px]">
                        <BarChart data={detailedPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => {
                                            if (name === 'return')
                                                return `${Number(value).toFixed(1)}%`
                                            return formatCurrency(Number(value))
                                        }}
                                    />
                                }
                            />
                            <defs>
                                <linearGradient
                                    id="detailedValueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-rose)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-rose)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="detailedReturnGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-fuchsia)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-fuchsia)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <Bar
                                dataKey="value"
                                fill="url(#detailedValueGradient)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="return"
                                fill="url(#detailedReturnGradient)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Commodities Portfolio</CardTitle>
                    <CardDescription>All commodity positions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Shares/Units</TableHead>
                                    <TableHead>Cost Basis</TableHead>
                                    <TableHead>Current Value</TableHead>
                                    <TableHead>Return</TableHead>
                                    <TableHead>Broker</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allCommodities.map((asset, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {asset['Asset name']}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{asset['Asset type']}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {parseNumericValue(
                                                asset[
                                                    'Number of shares or units in the portfolio to date'
                                                ]
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                parseNumericValue(
                                                    asset[
                                                        'Total equity investment in asset (at cost) / Paid-in Capital'
                                                    ]
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                parseNumericValue(
                                                    asset['Estimated asset value to date']
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    parseNumericValue(
                                                        asset['Total asset return to date']
                                                    ) >= 0
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {formatPercentage(
                                                    parseNumericValue(
                                                        asset['Total asset return to date']
                                                    )
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {asset['Broker / Asset Manager']}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
