'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useGetReportQuery, portfolioReportsApi } from '@/redux/services/portfolioReportsApi'
import { useAppDispatch } from '@/redux/hooks'
import type { ReportStatus } from '../types'

/**
 * Polling strategy per API spec:
 * - 0-10 seconds: Poll every 2s
 * - 10-60 seconds: Poll every 5s
 * - 60+ seconds: Poll every 10s
 * - Max wait: 10 minutes (600 seconds)
 */

const POLLING_INTERVALS = {
    FAST: 2000, // 2 seconds
    MEDIUM: 5000, // 5 seconds
    SLOW: 10000 // 10 seconds
}

const MAX_POLLING_TIME = 600000 // 10 minutes in ms

const getPollingInterval = (elapsedMs: number): number => {
    if (elapsedMs < 10000) return POLLING_INTERVALS.FAST
    if (elapsedMs < 60000) return POLLING_INTERVALS.MEDIUM
    return POLLING_INTERVALS.SLOW
}

const isTerminalStatus = (status: ReportStatus): boolean => {
    return status === 'completed' || status === 'failed'
}

interface UseReportPollingResult {
    data: ReturnType<typeof useGetReportQuery>['data']
    isLoading: boolean
    isFetching: boolean
    error: ReturnType<typeof useGetReportQuery>['error']
    isPolling: boolean
    elapsedTime: number
    isTimedOut: boolean
    refetch: () => void
}

export const useReportPolling = (
    reportId: string | null,
    options?: { skip?: boolean }
): UseReportPollingResult => {
    const dispatch = useAppDispatch()
    const [isPolling, setIsPolling] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isTimedOut, setIsTimedOut] = useState(false)
    const startTimeRef = useRef<number | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const { data, isLoading, isFetching, error, refetch } = useGetReportQuery(reportId ?? '', {
        skip: !reportId || options?.skip
    })

    const stopPolling = useCallback(() => {
        setIsPolling(false)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    // Handle polling based on report status
    useEffect(() => {
        if (!data || options?.skip || !reportId) {
            stopPolling()
            return
        }

        if (isTerminalStatus(data.status)) {
            // Invalidate the list cache so it refetches with the updated status
            dispatch(portfolioReportsApi.util.invalidateTags([{ type: 'Report', id: 'LIST' }]))
            stopPolling()
            return
        }

        // Report is pending or in_progress - start/continue polling
        if (startTimeRef.current === null) {
            startTimeRef.current = Date.now()
        }
        setIsPolling(true)

        // Calculate current elapsed time and interval
        const elapsed = Date.now() - startTimeRef.current
        setElapsedTime(elapsed)

        if (elapsed >= MAX_POLLING_TIME) {
            setIsTimedOut(true)
            stopPolling()
            return
        }

        const interval = getPollingInterval(elapsed)

        // Schedule next poll
        timeoutRef.current = setTimeout(() => {
            refetch()
        }, interval)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [data, options?.skip, reportId, refetch, stopPolling, dispatch])

    // Reset state when reportId changes
    useEffect(() => {
        startTimeRef.current = null
        setElapsedTime(0)
        setIsTimedOut(false)
        setIsPolling(false)
    }, [reportId])

    return {
        data,
        isLoading,
        isFetching,
        error,
        isPolling,
        elapsedTime,
        isTimedOut,
        refetch
    }
}
