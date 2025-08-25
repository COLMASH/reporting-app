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
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter
} from 'recharts'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { formatCurrency, formatPercentage, parseNumericValue } from '../utils/portfolio-utils'
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'
import { defaultChartConfig } from '../config/chart-config'

// Safe color cycling - CSS only defines 5 chart colors
const MAX_CHART_COLORS = 5

const getChartColor = (index: number): string => {
    const colorNumber = (index % MAX_CHART_COLORS) + 1
    return `var(--chart-${colorNumber})`
}

export const EquitiesDashboard = () => {
    const { getAssetsByType } = usePortfolioData()
    const equities = getAssetsByType('Equities')

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

    const maxTopItems = 5
    const topGainers = [...equities]
        .sort(
            (a, b) =>
                parseNumericValue(b['Total asset return to date']) -
                parseNumericValue(a['Total asset return to date'])
        )
        .slice(0, Math.min(maxTopItems, equities.length))

    const topLosers = [...equities]
        .sort(
            (a, b) =>
                parseNumericValue(a['Total asset return to date']) -
                parseNumericValue(b['Total asset return to date'])
        )
        .slice(0, Math.min(maxTopItems, equities.length))

    const maxPerformanceItems = 10
    const performanceData = equities
        .map((equity, index) => ({
            name: equity['Asset name'].substring(0, 20),
            value: parseNumericValue(equity['Estimated asset value to date']),
            return: parseNumericValue(equity['Total asset return to date']) * 100,
            shares: parseNumericValue(equity['Number of shares or units in the portfolio to date']),
            fill: getChartColor(index)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, Math.min(maxPerformanceItems, equities.length))

    const brokerDistribution = equities.reduce(
        (acc, equity) => {
            const broker = equity['Broker / Asset Manager'] || 'Unknown'
            if (!acc[broker]) acc[broker] = { name: broker, value: 0, count: 0 }
            acc[broker].value += parseNumericValue(equity['Estimated asset value to date'])
            acc[broker].count++
            return acc
        },
        {} as Record<string, { name: string; value: number; count: number }>
    )

    const brokerData = Object.values(brokerDistribution).map((broker, index) => ({
        ...broker,
        fill: getChartColor(index)
    }))

    const sectorAnalysis = equities.reduce(
        (acc, equity) => {
            const group = equity['Asset sub-group'] || 'General'
            if (!acc[group]) acc[group] = { name: group, value: 0, count: 0, avgReturn: 0 }
            acc[group].value += parseNumericValue(equity['Estimated asset value to date'])
            acc[group].count++
            acc[group].avgReturn += parseNumericValue(equity['Total asset return to date'])
            return acc
        },
        {} as Record<string, { name: string; value: number; count: number; avgReturn: number }>
    )

    const sectorData = Object.values(sectorAnalysis).map((sector, index) => ({
        ...sector,
        avgReturn: sector.count > 0 ? (sector.avgReturn / sector.count) * 100 : 0,
        fill: getChartColor(index)
    }))

    const scatterData = equities.map(equity => ({
        x: parseNumericValue(
            equity['Total equity investment in asset (at cost) / Paid-in Capital']
        ),
        y: parseNumericValue(equity['Total asset return to date']) * 100,
        z: parseNumericValue(equity['Estimated asset value to date']),
        name: equity['Asset name'].substring(0, 20)
    }))

    const portfolioFlowData = [
        { name: 'Total Commitment', value: totalCost, fill: `var(--color-violet)` },
        { name: 'Current Value', value: totalValue, fill: `var(--color-emerald)` },
        {
            name: totalReturn >= 0 ? 'Profit' : 'Loss',
            value: Math.abs(totalReturn),
            fill: totalReturn >= 0 ? `var(--color-emerald)` : `var(--color-rose)`
        }
    ]

    const maxConcentrationItems = 5
    const concentrationData = performanceData
        .slice(0, Math.min(maxConcentrationItems, performanceData.length))
        .map((item, index) => ({
            name: item.name,
            value: item.value,
            percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
            fill: getChartColor(index)
        }))

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Equity Value</CardTitle>
                        <BarChart3 className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                        <p className="text-muted-foreground text-xs">{equities.length} positions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                        {returnPercentage >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReturn)}</div>
                        <p
                            className={`text-xs ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {formatPercentage(returnPercentage)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="truncate text-lg font-bold">
                            {topGainers[0]?.['Asset name']?.substring(0, 20) || 'N/A'}
                        </div>
                        <p className="text-xs text-green-600">
                            {topGainers[0]
                                ? formatPercentage(
                                      parseNumericValue(topGainers[0]['Total asset return to date'])
                                  )
                                : 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
                        <Activity className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(
                                (equities.filter(
                                    e => parseNumericValue(e['Total asset return to date']) > 0
                                ).length /
                                    equities.length) *
                                    100
                            )}
                            %
                        </div>
                        <p className="text-muted-foreground text-xs">Profitable positions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Distribution</CardTitle>
                        <CardDescription>Value and returns by equity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
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
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {performanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Risk-Return Analysis</CardTitle>
                        <CardDescription>Investment vs returns scatter plot</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="x"
                                    name="Investment"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    dataKey="y"
                                    name="Return %"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => {
                                                if (name === 'y')
                                                    return `${Number(value).toFixed(1)}%`
                                                return formatCurrency(Number(value))
                                            }}
                                        />
                                    }
                                />
                                <Scatter
                                    name="Equities"
                                    data={scatterData}
                                    fill="var(--color-blue)"
                                >
                                    {scatterData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.y >= 0
                                                    ? `var(--color-emerald)`
                                                    : `var(--color-rose)`
                                            }
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Broker Distribution</CardTitle>
                        <CardDescription>Assets by management firm</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <PieChart>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={value => formatCurrency(Number(value))}
                                        />
                                    }
                                />
                                <Pie
                                    data={brokerData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {brokerData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sector Analysis</CardTitle>
                        <CardDescription>Performance by sector</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <AreaChart data={sectorData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => {
                                                if (name === 'avgReturn')
                                                    return `${Number(value).toFixed(1)}%`
                                                return formatCurrency(Number(value))
                                            }}
                                        />
                                    }
                                />
                                <defs>
                                    <linearGradient id="sectorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-amber)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-amber)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--color-amber)"
                                    fill="url(#sectorGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Portfolio Flow</CardTitle>
                        <CardDescription>Investment to returns flow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <BarChart data={portfolioFlowData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={value => formatCurrency(Number(value))}
                                        />
                                    }
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                    {portfolioFlowData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Gainers</CardTitle>
                        <CardDescription>Best performing equity positions</CardDescription>
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
                                            {
                                                equity[
                                                    'Asset ticker symbol, identification code or ISIN'
                                                ]
                                            }
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {formatCurrency(
                                                parseNumericValue(
                                                    equity['Estimated asset value to date']
                                                )
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

                <Card>
                    <CardHeader>
                        <CardTitle>Top Losers</CardTitle>
                        <CardDescription>Worst performing equity positions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topLosers.map((equity, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {equity['Asset name']}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {
                                                equity[
                                                    'Asset ticker symbol, identification code or ISIN'
                                                ]
                                            }
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {formatCurrency(
                                                parseNumericValue(
                                                    equity['Estimated asset value to date']
                                                )
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
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Concentration</CardTitle>
                    <CardDescription>Top 5 holdings by value</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={defaultChartConfig} className="h-[200px]">
                        <LineChart data={concentrationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => {
                                            if (name === 'percentage')
                                                return `${Number(value).toFixed(1)}%`
                                            return formatCurrency(Number(value))
                                        }}
                                    />
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--color-violet)"
                                strokeWidth={3}
                                dot={{ fill: 'var(--color-violet)', strokeWidth: 2, r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="var(--color-cyan)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: 'var(--color-cyan)', strokeWidth: 2, r: 3 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Equity Holdings</CardTitle>
                    <CardDescription>Complete list of equity positions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>Ticker/ISIN</TableHead>
                                    <TableHead>Shares</TableHead>
                                    <TableHead>Cost Basis</TableHead>
                                    <TableHead>Current Value</TableHead>
                                    <TableHead>Return</TableHead>
                                    <TableHead>Broker</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equities.map((equity, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {equity['Asset name']}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {
                                                equity[
                                                    'Asset ticker symbol, identification code or ISIN'
                                                ]
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {parseNumericValue(
                                                equity[
                                                    'Number of shares or units in the portfolio to date'
                                                ]
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                parseNumericValue(
                                                    equity[
                                                        'Total equity investment in asset (at cost) / Paid-in Capital'
                                                    ]
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                parseNumericValue(
                                                    equity['Estimated asset value to date']
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    parseNumericValue(
                                                        equity['Total asset return to date']
                                                    ) >= 0
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {formatPercentage(
                                                    parseNumericValue(
                                                        equity['Total asset return to date']
                                                    )
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {equity['Broker / Asset Manager']}
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
