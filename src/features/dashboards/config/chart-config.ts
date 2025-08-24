import { ChartConfig } from '@/components/ui/chart'

// Vivid color palette for charts
export const CHART_COLORS = {
    violet: 'hsl(263, 70%, 50%)',
    blue: 'hsl(217, 91%, 60%)',
    cyan: 'hsl(188, 86%, 53%)',
    emerald: 'hsl(158, 64%, 52%)',
    amber: 'hsl(38, 92%, 50%)',
    rose: 'hsl(346, 77%, 56%)',
    fuchsia: 'hsl(292, 84%, 61%)',
    indigo: 'hsl(239, 84%, 67%)',
    teal: 'hsl(172, 66%, 50%)',
    orange: 'hsl(25, 95%, 53%)',
    lime: 'hsl(84, 81%, 44%)',
    pink: 'hsl(330, 81%, 60%)'
}

// Chart configurations with theme support
export const defaultChartConfig: ChartConfig = {
    violet: {
        label: 'Violet',
        theme: {
            light: CHART_COLORS.violet,
            dark: 'hsl(263, 85%, 65%)'
        }
    },
    blue: {
        label: 'Blue',
        theme: {
            light: CHART_COLORS.blue,
            dark: 'hsl(217, 91%, 70%)'
        }
    },
    cyan: {
        label: 'Cyan',
        theme: {
            light: CHART_COLORS.cyan,
            dark: 'hsl(188, 86%, 63%)'
        }
    },
    emerald: {
        label: 'Emerald',
        theme: {
            light: CHART_COLORS.emerald,
            dark: 'hsl(158, 64%, 62%)'
        }
    },
    amber: {
        label: 'Amber',
        theme: {
            light: CHART_COLORS.amber,
            dark: 'hsl(38, 92%, 60%)'
        }
    },
    rose: {
        label: 'Rose',
        theme: {
            light: CHART_COLORS.rose,
            dark: 'hsl(346, 77%, 66%)'
        }
    },
    fuchsia: {
        label: 'Fuchsia',
        theme: {
            light: CHART_COLORS.fuchsia,
            dark: 'hsl(292, 84%, 71%)'
        }
    },
    indigo: {
        label: 'Indigo',
        theme: {
            light: CHART_COLORS.indigo,
            dark: 'hsl(239, 84%, 77%)'
        }
    },
    teal: {
        label: 'Teal',
        theme: {
            light: CHART_COLORS.teal,
            dark: 'hsl(172, 66%, 60%)'
        }
    },
    orange: {
        label: 'Orange',
        theme: {
            light: CHART_COLORS.orange,
            dark: 'hsl(25, 95%, 63%)'
        }
    }
}

export const getChartColor = (index: number): string => {
    const colors = Object.keys(CHART_COLORS)
    return `var(--color-${colors[index % colors.length]})`
}
