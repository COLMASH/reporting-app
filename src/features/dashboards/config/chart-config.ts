import { ChartConfig } from '@/components/ui/chart'

// Vivid color palette for charts - limited to 5 colors to match CSS variables
export const CHART_COLORS = {
    violet: 'hsl(263, 70%, 50%)',
    blue: 'hsl(217, 91%, 60%)',
    cyan: 'hsl(188, 86%, 53%)',
    emerald: 'hsl(158, 64%, 52%)',
    amber: 'hsl(38, 92%, 50%)'
}

// Extended color names for semantic usage (will cycle through available CSS variables)
export const CHART_COLOR_NAMES = [
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
] as const

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
    // Additional colors reuse the 5 base colors with variations
    rose: {
        label: 'Rose',
        theme: {
            light: 'hsl(346, 77%, 56%)',
            dark: 'hsl(346, 77%, 66%)'
        }
    },
    fuchsia: {
        label: 'Fuchsia',
        theme: {
            light: 'hsl(292, 84%, 61%)',
            dark: 'hsl(292, 84%, 71%)'
        }
    },
    indigo: {
        label: 'Indigo',
        theme: {
            light: 'hsl(239, 84%, 67%)',
            dark: 'hsl(239, 84%, 77%)'
        }
    },
    teal: {
        label: 'Teal',
        theme: {
            light: 'hsl(172, 66%, 50%)',
            dark: 'hsl(172, 66%, 60%)'
        }
    },
    orange: {
        label: 'Orange',
        theme: {
            light: 'hsl(25, 95%, 53%)',
            dark: 'hsl(25, 95%, 63%)'
        }
    }
}

// Safe color cycling function that always returns a valid chart color
// CSS only defines --chart-1 through --chart-5, so we cycle through these
export const getChartColor = (index: number): string => {
    const MAX_CHART_COLORS = 5 // CSS defines --chart-1 through --chart-5
    const colorNumber = (index % MAX_CHART_COLORS) + 1
    return `var(--chart-${colorNumber})`
}

// Get color for a specific item, ensuring consistent color assignment
export const getItemColor = (index: number): string => {
    return getChartColor(index)
}
