'use client'

import { useSearchParams } from 'next/navigation'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ReportsDataTable } from './reports-data-table'
import { CreateReportDialog } from './create-report-dialog'
import { ReportDetailDialog } from './report-detail-dialog'
import { usePortfolioReports } from '../hooks/use-portfolio-reports'
import { ROUTES } from '@/routes'
import { toast } from 'sonner'

export const PortfolioReportsPage = () => {
    const searchParams = useSearchParams()
    const {
        reports,
        total,
        isLoading,
        isFetching,
        error: fetchError,
        page,
        pageSize,
        setPage,
        setPageSize,
        createReport,
        isCreating,
        deleteReport,
        isDeleting,
        selectedReport,
        isCreateDialogOpen,
        openCreateDialog,
        closeCreateDialog,
        isDetailDialogOpen,
        openDetailDialog,
        closeDetailDialog
    } = usePortfolioReports()

    // Get initial filters from URL (pre-fill from dashboard context)
    const initialFilters = {
        holdingCompany: searchParams.get('holding_company'),
        assetType: searchParams.get('asset_type'),
        reportDate: searchParams.get('report_date')
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteReport(id)
            toast.success('Report deleted')
        } catch {
            toast.error('Failed to delete report')
        }
    }

    if (fetchError) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <h3 className="text-foreground mb-2 text-lg font-medium">
                        Failed to load reports
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                        An error occurred while loading your reports.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <Link href={ROUTES.PORTFOLIO_DASHBOARDS}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">AI Portfolio Reports</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Generate AI-powered analysis reports for your portfolio.
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Report
                </Button>
            </div>

            {/* Reports Table */}
            <ReportsDataTable
                reports={reports}
                total={total}
                page={page}
                pageSize={pageSize}
                isLoading={isLoading}
                isFetching={isFetching}
                isDeleting={isDeleting}
                onView={openDetailDialog}
                onDelete={handleDelete}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />

            {/* Create Dialog */}
            <CreateReportDialog
                open={isCreateDialogOpen}
                onOpenChange={open => (open ? openCreateDialog() : closeCreateDialog())}
                onSubmit={createReport}
                isSubmitting={isCreating}
                initialFilters={initialFilters}
            />

            {/* Detail Dialog */}
            <ReportDetailDialog
                report={selectedReport}
                open={isDetailDialogOpen}
                onOpenChange={open => !open && closeDetailDialog()}
                onDelete={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}
