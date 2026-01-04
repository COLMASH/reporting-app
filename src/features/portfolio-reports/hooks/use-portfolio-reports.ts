'use client'

import { useState, useCallback } from 'react'
import {
    useGetReportsQuery,
    useCreateReportMutation,
    useDeleteReportMutation
} from '@/redux/services/portfolioReportsApi'
import type { ReportResponse, CreateReportRequest } from '../types'

interface UsePortfolioReportsResult {
    reports: ReportResponse[]
    total: number
    isLoading: boolean
    isFetching: boolean
    error: unknown

    // Pagination
    page: number
    pageSize: number
    setPage: (page: number) => void
    setPageSize: (size: number) => void

    // Mutations
    createReport: (request: CreateReportRequest) => Promise<ReportResponse>
    isCreating: boolean
    deleteReport: (id: string) => Promise<void>
    isDeleting: boolean

    // Selection state
    selectedReport: ReportResponse | null
    selectReport: (report: ReportResponse | null) => void

    // Create dialog state
    isCreateDialogOpen: boolean
    openCreateDialog: () => void
    closeCreateDialog: () => void

    // Detail dialog state
    isDetailDialogOpen: boolean
    openDetailDialog: (report: ReportResponse) => void
    closeDetailDialog: () => void

    // Refetch
    refetch: () => void
}

export const usePortfolioReports = (): UsePortfolioReportsResult => {
    const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    // Pagination state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const offset = (page - 1) * pageSize

    // Queries
    const { data, isLoading, isFetching, error, refetch } = useGetReportsQuery({
        limit: pageSize,
        offset
    })

    // Mutations
    const [createReportMutation, { isLoading: isCreating }] = useCreateReportMutation()
    const [deleteReportMutation, { isLoading: isDeleting }] = useDeleteReportMutation()

    const createReport = useCallback(
        async (request: CreateReportRequest): Promise<ReportResponse> => {
            const result = await createReportMutation(request).unwrap()
            setIsCreateDialogOpen(false)
            return result
        },
        [createReportMutation]
    )

    const deleteReport = useCallback(
        async (id: string): Promise<void> => {
            await deleteReportMutation(id).unwrap()
            if (selectedReport?.id === id) {
                setSelectedReport(null)
                setIsDetailDialogOpen(false)
            }
        },
        [deleteReportMutation, selectedReport]
    )

    const selectReport = useCallback((report: ReportResponse | null) => {
        setSelectedReport(report)
    }, [])

    const openCreateDialog = useCallback(() => {
        setIsCreateDialogOpen(true)
    }, [])

    const closeCreateDialog = useCallback(() => {
        setIsCreateDialogOpen(false)
    }, [])

    const openDetailDialog = useCallback((report: ReportResponse) => {
        setSelectedReport(report)
        setIsDetailDialogOpen(true)
    }, [])

    const closeDetailDialog = useCallback(() => {
        setIsDetailDialogOpen(false)
    }, [])

    // Handle page size change - reset to page 1
    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize)
        setPage(1)
    }, [])

    return {
        reports: data?.reports ?? [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        error,

        page,
        pageSize,
        setPage,
        setPageSize: handlePageSizeChange,

        createReport,
        isCreating,
        deleteReport,
        isDeleting,

        selectedReport,
        selectReport,

        isCreateDialogOpen,
        openCreateDialog,
        closeCreateDialog,

        isDetailDialogOpen,
        openDetailDialog,
        closeDetailDialog,

        refetch
    }
}
