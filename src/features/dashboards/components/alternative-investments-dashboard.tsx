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
    AreaChart,
    Area
} from 'recharts'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { defaultChartConfig } from '../config/chart-config'
import { formatCurrency, formatPercentage, parseNumericValue } from '../utils/portfolio-utils'
import { Rocket, Building2, Search, Coins } from 'lucide-react'

const chartColors = [
    'violet',
    'blue',
    'cyan',
    'emerald',
    'amber',
    'rose',
    'fuchsia',
    'indigo',
    'teal',
    'orange'
]

export const AlternativeInvestmentsDashboard = () => {
    const { getAssetsByType } = usePortfolioData()

    const privateEquity = getAssetsByType('Private Equity Fund')
    const ventureCapital = getAssetsByType('Venture Capital Fund')
    const vcStartups = getAssetsByType('Venture Capital startup')
    const searchFunds = getAssetsByType('Fund of Search Funds')
    const searchFund = getAssetsByType('Search Fund')
    const vcCrypto = getAssetsByType('Venture Capital & Crypto Assets Fund')
    const privateDebt = getAssetsByType('Private Debt')
    const peDirectOwnership = getAssetsByType('Private Equity direct ownership')
    const fundOfFunds = getAssetsByType('Fund of Funds')

    const allAlternatives = [
        ...privateEquity,
        ...ventureCapital,
        ...vcStartups,
        ...searchFunds,
        ...searchFund,
        ...vcCrypto,
        ...privateDebt,
        ...peDirectOwnership,
        ...fundOfFunds
    ]

    const totalValue = allAlternatives.reduce(
        (sum, asset) => sum + parseNumericValue(asset['Estimated asset value to date']),
        0
    )

    const totalCommitment = allAlternatives.reduce(
        (sum, asset) => sum + parseNumericValue(asset['Total investment commitment']),
        0
    )

    const unfundedCommitment = allAlternatives.reduce(
        (sum, asset) => sum + parseNumericValue(asset['Pending investment / Unfunded Commitment']),
        0
    )

    const categoriesData = [
        {
            name: 'Private Equity',
            value: privateEquity.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: privateEquity.length,
            fill: `var(--color-${chartColors[0]})`
        },
        {
            name: 'VC Funds',
            value: ventureCapital.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: ventureCapital.length,
            fill: `var(--color-${chartColors[1]})`
        },
        {
            name: 'VC Startups',
            value: vcStartups.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: vcStartups.length,
            fill: `var(--color-${chartColors[2]})`
        },
        {
            name: 'Search Funds',
            value: [...searchFunds, ...searchFund].reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: searchFunds.length + searchFund.length,
            fill: `var(--color-${chartColors[3]})`
        },
        {
            name: 'Private Debt',
            value: privateDebt.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: privateDebt.length,
            fill: `var(--color-${chartColors[4]})`
        },
        {
            name: 'Fund of Funds',
            value: fundOfFunds.reduce(
                (sum, a) => sum + parseNumericValue(a['Estimated asset value to date']),
                0
            ),
            count: fundOfFunds.length,
            fill: `var(--color-${chartColors[5]})`
        }
    ].filter(cat => cat.value > 0)

    const commitmentData = allAlternatives
        .map((asset, index) => ({
            name: asset['Asset name'].substring(0, 30),
            commitment: parseNumericValue(asset['Total investment commitment']),
            paidIn: parseNumericValue(
                asset['Total equity investment in asset (at cost) / Paid-in Capital']
            ),
            unfunded: parseNumericValue(asset['Pending investment / Unfunded Commitment']),
            fill: `var(--color-${chartColors[index % chartColors.length]})`
        }))
        .filter(a => a.commitment > 0)
        .slice(0, 10)

    const performanceData = allAlternatives
        .filter(a => parseNumericValue(a['Total asset return to date']) !== 0)
        .map((asset, index) => ({
            name: asset['Asset name'].substring(0, 25),
            return: parseNumericValue(asset['Total asset return to date']) * 100,
            value: parseNumericValue(asset['Estimated asset value to date']),
            fill: `var(--color-${chartColors[index % chartColors.length]})`
        }))
        .sort((a, b) => b.return - a.return)
        .slice(0, 8)

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Alternative Assets
                        </CardTitle>
                        <Rocket className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                        <p className="text-muted-foreground text-xs">
                            {allAlternatives.length} investments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commitment</CardTitle>
                        <Coins className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalCommitment)}</div>
                        <p className="text-muted-foreground text-xs">Across all funds</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unfunded Commitment</CardTitle>
                        <Building2 className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(unfundedCommitment)}
                        </div>
                        <p className="text-muted-foreground text-xs">Pending capital calls</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">VC Startups</CardTitle>
                        <Search className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{vcStartups.length}</div>
                        <p className="text-muted-foreground text-xs">Direct investments</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Alternative Asset Categories</CardTitle>
                        <CardDescription>Distribution by investment type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <PieChart>
                                <Pie
                                    data={categoriesData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percentage }) =>
                                        `${name}: ${(percentage * 100).toFixed(0)}%`
                                    }
                                >
                                    {categoriesData.map((entry, index) => (
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Analysis</CardTitle>
                        <CardDescription>Returns by alternative investment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
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
                                        id="performanceGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
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
                                </defs>
                                <Bar
                                    dataKey="return"
                                    fill="url(#performanceGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Commitment Analysis</CardTitle>
                    <CardDescription>Capital deployment status</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={defaultChartConfig} className="h-[300px]">
                        <AreaChart data={commitmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={value => formatCurrency(Number(value))}
                                    />
                                }
                            />
                            <defs>
                                <linearGradient id="commitmentGradient" x1="0" y1="0" x2="0" y2="1">
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
                                <linearGradient id="paidInGradient" x1="0" y1="0" x2="0" y2="1">
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
                                <linearGradient id="unfundedGradient" x1="0" y1="0" x2="0" y2="1">
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
                            <Area
                                type="monotone"
                                dataKey="commitment"
                                stackId="1"
                                stroke="var(--color-violet)"
                                fill="url(#commitmentGradient)"
                                fillOpacity={0.6}
                            />
                            <Area
                                type="monotone"
                                dataKey="paidIn"
                                stackId="2"
                                stroke="var(--color-blue)"
                                fill="url(#paidInGradient)"
                                fillOpacity={0.6}
                            />
                            <Area
                                type="monotone"
                                dataKey="unfunded"
                                stackId="2"
                                stroke="var(--color-cyan)"
                                fill="url(#unfundedGradient)"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alternative Investments Portfolio</CardTitle>
                    <CardDescription>All alternative investment positions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Investment Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Commitment</TableHead>
                                    <TableHead>Paid-in Capital</TableHead>
                                    <TableHead>Current Value</TableHead>
                                    <TableHead>Unfunded</TableHead>
                                    <TableHead>Return</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allAlternatives.map((asset, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="max-w-[200px] truncate font-medium">
                                            {asset['Asset name']}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{asset['Asset type']}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                parseNumericValue(
                                                    asset['Total investment commitment']
                                                )
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
                                            {formatCurrency(
                                                parseNumericValue(
                                                    asset[
                                                        'Pending investment / Unfunded Commitment'
                                                    ]
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {parseNumericValue(
                                                asset['Total asset return to date']
                                            ) !== 0 && (
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
                                            )}
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
