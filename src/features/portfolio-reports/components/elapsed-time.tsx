'use client'

import { useState, useEffect } from 'react'
import type { ReportStatus } from '../types'

interface ElapsedTimeProps {
    createdAt: string
    status: ReportStatus
}

/**
 * Calculates elapsed time from a timestamp.
 * Handles UTC normalization and microseconds trimming.
 */
const getTimeElapsed = (startTime: string): string => {
    // Trim microseconds if present (keep only up to milliseconds)
    let normalizedTime = startTime
    const dotIndex = startTime.indexOf('.')
    if (dotIndex !== -1) {
        // Keep only 3 digits after the decimal point for milliseconds
        normalizedTime = startTime.substring(0, dotIndex + 4)
    }

    // Ensure the timestamp is treated as UTC by appending 'Z' if not present
    const utcTime = normalizedTime.endsWith('Z') ? normalizedTime : normalizedTime + 'Z'

    const start = new Date(utcTime)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000)

    // Handle invalid dates or negative differences
    if (isNaN(start.getTime()) || diff < 0) {
        return '0s'
    }

    if (diff < 60) return `${diff}s`
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60)
        const seconds = diff % 60
        return `${minutes}m ${seconds}s`
    }
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    return `${hours}h ${minutes}m`
}

/**
 * Displays elapsed time since report creation.
 * Updates every second for pending/in_progress reports.
 * Based on created_at timestamp - persists across page refreshes.
 */
export const ElapsedTime = ({ createdAt, status }: ElapsedTimeProps) => {
    const [, setTick] = useState(0)

    // Re-render every second for active reports
    useEffect(() => {
        if (status !== 'pending' && status !== 'in_progress') return

        const interval = setInterval(() => {
            setTick(t => t + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [status])

    return <span>{getTimeElapsed(createdAt)}</span>
}
