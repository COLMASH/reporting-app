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
    Line,
    ScatterChart,
    Scatter,
    ComposedChart
} from 'recharts'
import { usePortfolioData } from '../hooks/use-portfolio-data'
import { defaultChartConfig } from '../config/chart-config'
import { formatCurrency, formatPercentage, parseNumericValue } from '../utils/portfolio-utils'
import { Shield, TrendingUp, AlertCircle, Info } from 'lucide-react'

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

export const StructuredNotesDashboard = () => {
    const { getAssetsByType } = usePortfolioData()
    const structuredNotes = getAssetsByType('Structured notes')

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

    const averageCoupon =
        structuredNotes.reduce((sum, note) => {
            const coupon = parseNumericValue(note['Annual coupon of Structured Note'])
            return sum + coupon
        }, 0) / structuredNotes.length

    const maturityData = structuredNotes
        .filter(note => note['Final due date of Structured Note'])
        .map((note, index) => {
            const dueDate = note['Final due date of Structured Note']
            const year = dueDate ? new Date(dueDate).getFullYear() : new Date().getFullYear()
            return {
                name: note['Asset name'].substring(0, 20),
                year: year,
                value: parseNumericValue(note['Estimated asset value to date']),
                coupon: parseNumericValue(note['Annual coupon of Structured Note']) * 100,
                fill: `var(--color-${chartColors[index % chartColors.length]})`
            }
        })
        .sort((a, b) => a.year - b.year)

    const protectionData = structuredNotes.map((note, index) => ({
        name: note['Asset name'].substring(0, 25),
        capitalProtection: Math.abs(
            parseNumericValue(note['Capital protection of Structured Note']) * 100
        ),
        couponProtection: Math.abs(
            parseNumericValue(note['Coupon protection barrier (%) of Structured Note']) * 100
        ),
        currentPerformance:
            parseNumericValue(note['Performance of underlying index or asset vs. Strike level']) *
            100,
        fill: `var(--color-${chartColors[index % chartColors.length]})`
    }))

    const underlyingPerformance = structuredNotes
        .filter(note => note['Performance of underlying index or asset vs. Strike level'])
        .map((note, index) => ({
            name:
                note['Structured Note underlying index or asset basket - name']?.substring(0, 30) ||
                'Unknown',
            performance:
                parseNumericValue(
                    note['Performance of underlying index or asset vs. Strike level']
                ) * 100,
            strikeLevel: parseNumericValue(note['Strike level of underlying index or assets']),
            currentLevel: parseNumericValue(
                note['Underlying index or asset level as of 31 May 2025']
            ),
            fill: `var(--color-${chartColors[index % chartColors.length]})`
        }))

    const couponFrequencyData = structuredNotes.reduce(
        (acc, note) => {
            const freq = note['Coupon payment frequency'] || 'Unknown'
            if (!acc[freq]) acc[freq] = { name: freq, count: 0, value: 0 }
            acc[freq].count++
            acc[freq].value += parseNumericValue(note['Estimated asset value to date'])
            return acc
        },
        {} as Record<string, { name: string; count: number; value: number }>
    )

    const frequencyChartData = Object.values(couponFrequencyData).map((item, index) => ({
        ...item,
        fill: `var(--color-${chartColors[index % chartColors.length]})`
    }))

    const topPerformers = structuredNotes.slice(0, 5).map((note, index) => ({
        name: note['Asset name'].substring(0, 15),
        value: parseNumericValue(note['Total asset return to date']) * 100,
        fill: `var(--color-${chartColors[index % chartColors.length]})`
    }))

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notes Value</CardTitle>
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                        <p className="text-muted-foreground text-xs">
                            Cost basis: {formatCurrency(totalCost)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Coupon</CardTitle>
                        <Info className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(averageCoupon)}</div>
                        <p className="text-muted-foreground text-xs">Annual yield</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Notes</CardTitle>
                        <Shield className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{structuredNotes.length}</div>
                        <p className="text-muted-foreground text-xs">Structured products</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Protection Level</CardTitle>
                        <AlertCircle className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-50%</div>
                        <p className="text-muted-foreground text-xs">Average capital protection</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Maturity Timeline</CardTitle>
                        <CardDescription>Notes by maturity year and coupon rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <ComposedChart data={maturityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => {
                                                if (name === 'coupon')
                                                    return `${Number(value).toFixed(1)}%`
                                                return formatCurrency(Number(value))
                                            }}
                                        />
                                    }
                                />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
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
                                    yAxisId="left"
                                    dataKey="value"
                                    fill="url(#barGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="coupon"
                                    stroke="var(--color-cyan)"
                                    strokeWidth={2}
                                />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Protection vs Performance</CardTitle>
                        <CardDescription>
                            Capital protection barriers and current performance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[300px]">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="capitalProtection"
                                    name="Capital Protection"
                                    unit="%"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    dataKey="currentPerformance"
                                    name="Performance"
                                    unit="%"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={value => `${Number(value).toFixed(1)}%`}
                                        />
                                    }
                                />
                                <Scatter
                                    name="Notes"
                                    data={protectionData}
                                    fill="var(--color-emerald)"
                                />
                            </ScatterChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Underlying Performance</CardTitle>
                        <CardDescription>Performance vs strike level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <BarChart data={underlyingPerformance} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
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
                                            formatter={value => `${Number(value).toFixed(1)}%`}
                                        />
                                    }
                                />
                                <defs>
                                    <linearGradient
                                        id="performanceGradient"
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="0"
                                    >
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
                                </defs>
                                <Bar
                                    dataKey="performance"
                                    fill="url(#performanceGradient)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Coupon Payment Frequency</CardTitle>
                        <CardDescription>Distribution by payment schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <BarChart data={frequencyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip
                                    content={<ChartTooltipContent formatter={value => value} />}
                                />
                                <defs>
                                    <linearGradient
                                        id="frequencyGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
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
                                <Bar
                                    dataKey="count"
                                    fill="url(#frequencyGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Returns</CardTitle>
                        <CardDescription>Best performing structured notes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={defaultChartConfig} className="h-[250px]">
                            <BarChart data={topPerformers} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
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
                                            formatter={value => `${Number(value).toFixed(1)}%`}
                                        />
                                    }
                                />
                                <defs>
                                    <linearGradient
                                        id="returnsGradient"
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="0"
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
                                </defs>
                                <Bar
                                    dataKey="value"
                                    fill="url(#returnsGradient)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Structured Notes Details</CardTitle>
                    <CardDescription>
                        Complete list of structured notes in portfolio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>ISIN</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Coupon</TableHead>
                                    <TableHead>Maturity</TableHead>
                                    <TableHead>Underlying</TableHead>
                                    <TableHead>Performance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {structuredNotes.map((note, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="max-w-[200px] truncate font-medium">
                                            {note['Asset name']}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {
                                                note[
                                                    'Asset ticker symbol, identification code or ISIN'
                                                ]
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                parseNumericValue(
                                                    note['Estimated asset value to date']
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatPercentage(
                                                parseNumericValue(
                                                    note['Annual coupon of Structured Note']
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {note['Final due date of Structured Note']}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-xs">
                                            {
                                                note[
                                                    'Structured Note underlying index or asset basket - name'
                                                ]
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {note[
                                                'Performance of underlying index or asset vs. Strike level'
                                            ] && (
                                                <Badge
                                                    variant={
                                                        parseNumericValue(
                                                            note[
                                                                'Performance of underlying index or asset vs. Strike level'
                                                            ]
                                                        ) >= 0
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {
                                                        note[
                                                            'Performance of underlying index or asset vs. Strike level'
                                                        ]
                                                    }
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{note['Asset status']}</Badge>
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
