'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { ShimmerOverlay } from '@/components/ui/shimmer-overlay'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Eye,
    Trash2,
    Loader2,
    FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportStatusBadge } from './report-status-badge'
import { ElapsedTime } from './elapsed-time'
import { formatRelativeTime, getFiltersSummary } from '../utils/report-utils'
import { useReportPolling } from '../hooks/use-report-polling'
import type { ReportResponse } from '../types'

interface ReportsDataTableProps {
    reports: ReportResponse[]
    total: number
    page: number
    pageSize: number
    isLoading?: boolean
    isFetching?: boolean
    isDeleting?: boolean
    onView: (report: ReportResponse) => void
    onDelete: (id: string) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

interface ReportRowProps {
    report: ReportResponse
    onView: (report: ReportResponse) => void
    onDelete: (id: string) => void
    isDeleting?: boolean
}

const ReportRow = ({ report, onView, onDelete, isDeleting }: ReportRowProps) => {
    const needsPolling = report.status === 'pending' || report.status === 'in_progress'
    const { data: polledReport } = useReportPolling(needsPolling ? report.id : null, {
        skip: !needsPolling
    })

    const currentReport = polledReport ?? report
    const isActive = currentReport.status === 'pending' || currentReport.status === 'in_progress'
    const canView = currentReport.status === 'completed'

    return (
        <TableRow
            className={cn({
                'hover:bg-muted/80 cursor-pointer': canView
            })}
            onClick={canView ? () => onView(currentReport) : undefined}
        >
            <TableCell className="max-w-[300px]">
                <div className="flex items-center gap-2">
                    <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="truncate font-medium">{currentReport.title}</span>
                </div>
            </TableCell>
            <TableCell>
                <ReportStatusBadge status={currentReport.status} />
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {getFiltersSummary(currentReport)}
            </TableCell>
            <TableCell>
                {isActive ? (
                    <span className="text-primary flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <ElapsedTime
                            createdAt={currentReport.created_at}
                            status={currentReport.status}
                        />
                    </span>
                ) : (
                    <span className="text-muted-foreground">
                        {formatRelativeTime(currentReport.created_at)}
                    </span>
                )}
            </TableCell>
            <TableCell>
                <div
                    className="flex items-center justify-end gap-1"
                    onClick={e => e.stopPropagation()}
                >
                    {canView && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => onView(currentReport)}
                        >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                        </Button>
                    )}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive h-8 w-8"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete &ldquo;{currentReport.title}
                                    &rdquo;? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(currentReport.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}

export const ReportsDataTable = ({
    reports,
    total,
    page,
    pageSize,
    isLoading = false,
    isFetching = false,
    isDeleting = false,
    onView,
    onDelete,
    onPageChange,
    onPageSizeChange
}: ReportsDataTableProps) => {
    const isLoadingState = isLoading || isFetching
    const totalPages = Math.ceil(total / pageSize)

    return (
        <Card className="relative">
            <ShimmerOverlay isActive={isLoadingState} />
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">Reports</CardTitle>
                <CardDescription>
                    {total} {total === 1 ? 'report' : 'reports'} total
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingState && reports.length === 0 ? (
                    <div className="h-[300px]" />
                ) : reports.length === 0 ? (
                    <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 opacity-50" />
                        <span>No reports yet</span>
                        <span className="text-sm">
                            Create your first AI-powered portfolio report
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                            <Table className="min-w-[700px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead>Filters</TableHead>
                                        <TableHead className="w-[140px]">Created</TableHead>
                                        <TableHead className="w-[120px] text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map(report => (
                                        <ReportRow
                                            key={report.id}
                                            report={report}
                                            onView={onView}
                                            onDelete={onDelete}
                                            isDeleting={isDeleting}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            {/* Navigation buttons */}
                            <div className="flex items-center justify-center gap-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page <= 1}
                                    onClick={() => onPageChange(1)}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page <= 1}
                                    onClick={() => onPageChange(page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-muted-foreground min-w-[80px] text-center text-sm">
                                    {page} / {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page >= totalPages}
                                    onClick={() => onPageChange(page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page >= totalPages}
                                    onClick={() => onPageChange(totalPages)}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                            {/* Rows per page selector */}
                            <div className="flex items-center justify-center gap-2 sm:order-1 sm:justify-start">
                                <span className="text-muted-foreground text-sm">Rows</span>
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={value => onPageSizeChange(Number(value))}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
