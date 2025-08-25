// Safe color cycling utility - CSS only defines 5 chart colors
const MAX_CHART_COLORS = 5

/**
 * Get a chart color CSS variable based on index
 * Safely cycles through available chart colors (1-5)
 * @param index - The index to map to a color
 * @returns CSS variable string like 'var(--chart-1)'
 */
export const getChartColor = (index: number): string => {
    const colorNumber = (index % MAX_CHART_COLORS) + 1
    return `var(--chart-${colorNumber})`
}

/**
 * Get a chart color number (1-5) based on index
 * @param index - The index to map to a color number
 * @returns Color number between 1 and 5
 */
export const getChartColorNumber = (index: number): number => {
    return (index % MAX_CHART_COLORS) + 1
}
