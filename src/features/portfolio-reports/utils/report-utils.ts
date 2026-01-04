/**
 * Utility functions for portfolio reports.
 */

import type { ReportResponse } from '../types'

/**
 * Format a date string for display.
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

/**
 * Format a date string as relative time (e.g., "2 hours ago").
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
}

/**
 * Format processing time in a human-readable way.
 */
export const formatProcessingTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
}

/**
 * Format token counts for display.
 */
export const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return tokens.toString()
    return `${(tokens / 1000).toFixed(1)}k`
}

/**
 * Get a summary of filters applied to a report.
 */
export const getFiltersSummary = (report: ReportResponse): string => {
    const filters: string[] = []

    if (report.holding_company_filter) {
        filters.push(report.holding_company_filter)
    }
    if (report.entity_filter) {
        filters.push(report.entity_filter)
    }
    if (report.asset_type_filter) {
        filters.push(report.asset_type_filter)
    }
    if (report.report_date) {
        filters.push(report.report_date)
    }

    if (filters.length === 0) {
        return 'All data'
    }

    return filters.join(' • ')
}

/**
 * Download markdown content as a file.
 */
export const downloadMarkdown = (report: ReportResponse): void => {
    if (!report.markdown_content) return

    const blob = new Blob([report.markdown_content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
