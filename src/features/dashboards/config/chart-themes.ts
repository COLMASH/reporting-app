import { ChartConfig } from '@/components/ui/chart'

export type ChartTheme = 'green' | 'amber' | 'orange' | 'rose' | 'violet' | 'blue' | 'colored'

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
    green: {
        // Different tones of green - with dramatic contrast
        chart1: { light: 'hsl(142 85% 20%)', dark: 'hsl(142 85% 25%)' },
        chart2: { light: 'hsl(142 75% 35%)', dark: 'hsl(142 75% 45%)' },
        chart3: { light: 'hsl(142 65% 50%)', dark: 'hsl(142 70% 65%)' },
        chart4: { light: 'hsl(142 55% 65%)', dark: 'hsl(142 60% 80%)' },
        chart5: { light: 'hsl(142 45% 80%)', dark: 'hsl(142 50% 95%)' }
    },
    amber: {
        // Different tones of amber - with dramatic contrast
        chart1: { light: 'hsl(38 100% 20%)', dark: 'hsl(38 95% 25%)' },
        chart2: { light: 'hsl(38 95% 35%)', dark: 'hsl(38 90% 45%)' },
        chart3: { light: 'hsl(38 90% 50%)', dark: 'hsl(38 85% 65%)' },
        chart4: { light: 'hsl(38 85% 65%)', dark: 'hsl(38 80% 80%)' },
        chart5: { light: 'hsl(38 80% 80%)', dark: 'hsl(38 75% 95%)' }
    },
    orange: {
        // Different tones of orange - with dramatic contrast
        chart1: { light: 'hsl(25 100% 22%)', dark: 'hsl(25 95% 30%)' },
        chart2: { light: 'hsl(25 95% 37%)', dark: 'hsl(25 95% 50%)' },
        chart3: { light: 'hsl(25 90% 52%)', dark: 'hsl(25 90% 68%)' },
        chart4: { light: 'hsl(25 85% 67%)', dark: 'hsl(25 85% 83%)' },
        chart5: { light: 'hsl(25 80% 82%)', dark: 'hsl(25 80% 96%)' }
    },
    rose: {
        // Different tones of rose - with dramatic contrast
        chart1: { light: 'hsl(346 85% 20%)', dark: 'hsl(346 80% 28%)' },
        chart2: { light: 'hsl(346 80% 35%)', dark: 'hsl(346 75% 48%)' },
        chart3: { light: 'hsl(346 75% 50%)', dark: 'hsl(346 70% 65%)' },
        chart4: { light: 'hsl(346 70% 65%)', dark: 'hsl(346 65% 80%)' },
        chart5: { light: 'hsl(346 65% 80%)', dark: 'hsl(346 60% 95%)' }
    },
    violet: {
        // Different tones of violet - with dramatic contrast
        chart1: { light: 'hsl(263 80% 20%)', dark: 'hsl(263 95% 30%)' },
        chart2: { light: 'hsl(263 75% 35%)', dark: 'hsl(263 90% 48%)' },
        chart3: { light: 'hsl(263 70% 50%)', dark: 'hsl(263 85% 65%)' },
        chart4: { light: 'hsl(263 65% 65%)', dark: 'hsl(263 80% 80%)' },
        chart5: { light: 'hsl(263 60% 80%)', dark: 'hsl(263 75% 95%)' }
    },
    blue: {
        // Different tones of blue - with dramatic contrast
        chart1: { light: 'hsl(217 100% 30%)', dark: 'hsl(217 95% 40%)' },
        chart2: { light: 'hsl(217 95% 45%)', dark: 'hsl(217 90% 58%)' },
        chart3: { light: 'hsl(217 90% 60%)', dark: 'hsl(217 85% 73%)' },
        chart4: { light: 'hsl(217 85% 75%)', dark: 'hsl(217 80% 87%)' },
        chart5: { light: 'hsl(217 80% 88%)', dark: 'hsl(217 75% 97%)' }
    },
    colored: {
        chart1: { light: 'hsl(221 83% 53%)', dark: 'hsl(212 95% 68%)' },
        chart2: { light: 'hsl(25 95% 53%)', dark: 'hsl(25 95% 63%)' },
        chart3: { light: 'hsl(340 75% 55%)', dark: 'hsl(340 75% 65%)' },
        chart4: { light: 'hsl(188 86% 53%)', dark: 'hsl(188 86% 63%)' },
        chart5: { light: 'hsl(280 65% 60%)', dark: 'hsl(280 65% 70%)' }
    }
}

export const createChartConfig = (theme: ChartTheme = 'green'): ChartConfig => {
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

// Safe color cycling function that handles unlimited items
// CSS only defines --chart-1 through --chart-5, so we cycle through these
export const getChartThemeColor = (theme: ChartTheme, index: number): string => {
    const MAX_CHART_COLORS = 5 // CSS defines --chart-1 through --chart-5
    const chartNumber = (index % MAX_CHART_COLORS) + 1
    return `var(--chart-${chartNumber})`
}

export const chartThemeLabels: Record<ChartTheme, string> = {
    green: 'Green',
    amber: 'Amber',
    orange: 'Orange',
    rose: 'Rose',
    violet: 'Violet',
    blue: 'Blue',
    colored: 'Colored'
}
