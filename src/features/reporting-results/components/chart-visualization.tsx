'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    BarController,
    PieController,
    DoughnutController,
    RadarController,
    ScatterController,
    PolarAreaController,
    BubbleController,
    type ChartType
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { AnalysisResultCard } from './analysis-result-card'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import type {
    ChartData as ImportedChartData,
    ChartOptions as ImportedChartOptions
} from '@/redux/services/reportingAnalysesApi'
import type { ChartOptions as ChartJSOptions } from 'chart.js'

// Register all Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    BarController,
    PieController,
    DoughnutController,
    RadarController,
    ScatterController,
    PolarAreaController,
    BubbleController
)

interface ChartVisualizationProps {
    chartType: ChartType
    title: string
    description: string
    data: ImportedChartData
    options?: ImportedChartOptions
    insights?: string[]
    className?: string
    height?: string
}

export const ChartVisualization = ({
    chartType,
    title,
    description,
    data,
    options,
    insights,
    className,
    height = 'h-80'
}: ChartVisualizationProps) => {
    const chartRef = useRef<ChartJS | null>(null)
    const [chartError, setChartError] = useState<string | null>(null)

    // Default options with dark mode support
    const defaultOptions: ChartJSOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'oklch(var(--foreground))',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'oklch(var(--popover))',
                titleColor: 'oklch(var(--popover-foreground))',
                bodyColor: 'oklch(var(--popover-foreground))',
                borderColor: 'oklch(var(--border))',
                borderWidth: 1
            }
        },
        scales:
            chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea'
                ? {}
                : {
                      x: {
                          grid: {
                              color: 'oklch(var(--border))',
                              display: true
                          },
                          ticks: {
                              color: 'oklch(var(--muted-foreground))'
                          }
                      },
                      y: {
                          grid: {
                              color: 'oklch(var(--border))',
                              display: true
                          },
                          ticks: {
                              color: 'oklch(var(--muted-foreground))'
                          }
                      }
                  }
    }

    const mergedOptions: ChartJSOptions = {
        ...defaultOptions,
        ...(options as ChartJSOptions),
        plugins: {
            ...defaultOptions.plugins,
            ...(options?.plugins as ChartJSOptions['plugins'])
        }
    }

    // Apply theme colors to datasets if not specified
    useEffect(() => {
        try {
            if (data.datasets) {
                data.datasets.forEach((dataset, index) => {
                    if (!dataset.backgroundColor) {
                        const chartColors = [
                            'oklch(var(--chart-1))',
                            'oklch(var(--chart-2))',
                            'oklch(var(--chart-3))',
                            'oklch(var(--chart-4))',
                            'oklch(var(--chart-5))'
                        ]
                        dataset.backgroundColor = chartColors[index % chartColors.length]
                    }
                    if (!dataset.borderColor && chartType !== 'pie' && chartType !== 'doughnut') {
                        dataset.borderColor = dataset.backgroundColor
                    }
                })
            }
            // Reset error when data changes successfully
            setChartError(null)
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error preparing chart data:', error)
            setChartError('Failed to prepare chart data')
        }
    }, [data, chartType])

    return (
        <AnalysisResultCard
            title={title}
            description={description}
            className={className}
            contentClassName="p-0"
        >
            <div className="p-6">
                <div className={cn('relative', height)}>
                    {chartError ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <AlertCircle className="text-destructive mb-2 h-8 w-8" />
                            <p className="text-muted-foreground text-sm">Failed to render chart</p>
                            <p className="text-muted-foreground text-xs">{chartError}</p>
                        </div>
                    ) : (
                        <Chart
                            ref={instance => {
                                chartRef.current = instance as ChartJS | null
                            }}
                            type={chartType}
                            data={data as ImportedChartData}
                            options={mergedOptions}
                        />
                    )}
                </div>
                {insights && insights.length > 0 && (
                    <div className="border-border mt-6 space-y-2 border-t pt-4">
                        <h4 className="text-sm font-medium">Key Insights</h4>
                        <ul className="space-y-1">
                            {insights.map((insight, index) => (
                                <li
                                    key={index}
                                    className="text-muted-foreground flex items-start text-sm"
                                >
                                    <span className="bg-primary mt-1 mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AnalysisResultCard>
    )
}
