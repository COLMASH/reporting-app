import { ChartConfig } from '@/components/ui/chart'

export type ChartTheme = 'default' | 'green' | 'amber' | 'orange' | 'rose' | 'violet' | 'blue'

export const chartThemeColors: Record<
    ChartTheme,
    {
        chart1: { light: string; dark: string }
        chart2: { light: string; dark: string }
        chart3: { light: string; dark: string }
        chart4: { light: string; dark: string }
        chart5: { light: string; dark: string }
    }
> = {
    default: {
        chart1: { light: 'hsl(221 83% 53%)', dark: 'hsl(212 95% 68%)' },
        chart2: { light: 'hsl(25 95% 53%)', dark: 'hsl(25 95% 63%)' },
        chart3: { light: 'hsl(340 75% 55%)', dark: 'hsl(340 75% 65%)' },
        chart4: { light: 'hsl(188 86% 53%)', dark: 'hsl(188 86% 63%)' },
        chart5: { light: 'hsl(280 65% 60%)', dark: 'hsl(280 65% 70%)' }
    },
    green: {
        // Different tones of green - from darker to lighter
        chart1: { light: 'hsl(142 71% 35%)', dark: 'hsl(142 76% 57%)' },
        chart2: { light: 'hsl(142 71% 45%)', dark: 'hsl(142 76% 67%)' },
        chart3: { light: 'hsl(142 71% 55%)', dark: 'hsl(142 76% 77%)' },
        chart4: { light: 'hsl(142 71% 65%)', dark: 'hsl(142 76% 87%)' },
        chart5: { light: 'hsl(142 71% 75%)', dark: 'hsl(142 76% 95%)' }
    },
    amber: {
        // Different tones of amber - from darker to lighter
        chart1: { light: 'hsl(38 92% 35%)', dark: 'hsl(38 92% 55%)' },
        chart2: { light: 'hsl(38 92% 45%)', dark: 'hsl(38 92% 65%)' },
        chart3: { light: 'hsl(38 92% 55%)', dark: 'hsl(38 92% 75%)' },
        chart4: { light: 'hsl(38 92% 65%)', dark: 'hsl(38 92% 85%)' },
        chart5: { light: 'hsl(38 92% 75%)', dark: 'hsl(38 92% 95%)' }
    },
    orange: {
        // Different tones of orange - from darker to lighter
        chart1: { light: 'hsl(25 95% 38%)', dark: 'hsl(25 95% 58%)' },
        chart2: { light: 'hsl(25 95% 48%)', dark: 'hsl(25 95% 68%)' },
        chart3: { light: 'hsl(25 95% 58%)', dark: 'hsl(25 95% 78%)' },
        chart4: { light: 'hsl(25 95% 68%)', dark: 'hsl(25 95% 88%)' },
        chart5: { light: 'hsl(25 95% 78%)', dark: 'hsl(25 95% 95%)' }
    },
    rose: {
        // Different tones of rose - from darker to lighter
        chart1: { light: 'hsl(346 77% 35%)', dark: 'hsl(346 77% 55%)' },
        chart2: { light: 'hsl(346 77% 45%)', dark: 'hsl(346 77% 65%)' },
        chart3: { light: 'hsl(346 77% 55%)', dark: 'hsl(346 77% 75%)' },
        chart4: { light: 'hsl(346 77% 65%)', dark: 'hsl(346 77% 85%)' },
        chart5: { light: 'hsl(346 77% 75%)', dark: 'hsl(346 77% 95%)' }
    },
    violet: {
        // Different tones of violet - from darker to lighter
        chart1: { light: 'hsl(263 70% 35%)', dark: 'hsl(263 85% 55%)' },
        chart2: { light: 'hsl(263 70% 45%)', dark: 'hsl(263 85% 65%)' },
        chart3: { light: 'hsl(263 70% 55%)', dark: 'hsl(263 85% 75%)' },
        chart4: { light: 'hsl(263 70% 65%)', dark: 'hsl(263 85% 85%)' },
        chart5: { light: 'hsl(263 70% 75%)', dark: 'hsl(263 85% 95%)' }
    },
    blue: {
        // Different tones of blue - from darker to lighter
        chart1: { light: 'hsl(217 91% 45%)', dark: 'hsl(217 91% 65%)' },
        chart2: { light: 'hsl(217 91% 55%)', dark: 'hsl(217 91% 75%)' },
        chart3: { light: 'hsl(217 91% 65%)', dark: 'hsl(217 91% 85%)' },
        chart4: { light: 'hsl(217 91% 75%)', dark: 'hsl(217 91% 90%)' },
        chart5: { light: 'hsl(217 91% 85%)', dark: 'hsl(217 91% 95%)' }
    }
}

export const createChartConfig = (theme: ChartTheme = 'default'): ChartConfig => {
    const colors = chartThemeColors[theme]

    return {
        chart1: {
            label: 'Series 1',
            theme: {
                light: colors.chart1.light,
                dark: colors.chart1.dark
            }
        },
        chart2: {
            label: 'Series 2',
            theme: {
                light: colors.chart2.light,
                dark: colors.chart2.dark
            }
        },
        chart3: {
            label: 'Series 3',
            theme: {
                light: colors.chart3.light,
                dark: colors.chart3.dark
            }
        },
        chart4: {
            label: 'Series 4',
            theme: {
                light: colors.chart4.light,
                dark: colors.chart4.dark
            }
        },
        chart5: {
            label: 'Series 5',
            theme: {
                light: colors.chart5.light,
                dark: colors.chart5.dark
            }
        }
    }
}

export const getChartThemeColor = (theme: ChartTheme, index: number): string => {
    const chartNumber = (index % 5) + 1
    return `var(--chart-${chartNumber})`
}

export const chartThemeLabels: Record<ChartTheme, string> = {
    default: 'Default',
    green: 'Green',
    amber: 'Amber',
    orange: 'Orange',
    rose: 'Rose',
    violet: 'Violet',
    blue: 'Blue'
}
