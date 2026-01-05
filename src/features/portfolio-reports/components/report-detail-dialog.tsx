'use client'

import { Download, Trash2, X, Loader2, Clock, Zap, FileText } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { MarkdownRenderer } from './markdown-renderer'
import { ReportStatusBadge } from './report-status-badge'
import {
    formatDate,
    formatProcessingTime,
    formatTokens,
    getFiltersSummary,
    downloadMarkdown
} from '../utils/report-utils'
import type { ReportResponse } from '../types'

interface ReportDetailDialogProps {
    report: ReportResponse | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onDelete: (id: string) => void
    isDeleting?: boolean
}

export const ReportDetailDialog = ({
    report,
    open,
    onOpenChange,
    onDelete,
    isDeleting
}: ReportDetailDialogProps) => {
    if (!report) return null

    // Case-insensitive status check
    const normalizedStatus = report.status?.toLowerCase()
    const hasContent = normalizedStatus === 'completed' && report.markdown_content

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[90vh] max-w-6xl flex-col p-0 sm:max-w-6xl">
                {/* Header */}
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <FileText className="h-5 w-5 shrink-0" />
                                <span className="truncate">{report.title}</span>
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                View AI-generated portfolio analysis report
                            </DialogDescription>
                            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                <ReportStatusBadge status={report.status} />
                                <span>{formatDate(report.created_at)}</span>
                                <span>•</span>
                                <span>{getFiltersSummary(report)}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {hasContent ? (
                        <MarkdownRenderer content={report.markdown_content!} />
                    ) : normalizedStatus === 'failed' ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-destructive/10 mb-4 rounded-full p-4">
                                <X className="text-destructive h-8 w-8" />
                            </div>
                            <h3 className="text-foreground mb-1 text-lg font-medium">
                                Report Generation Failed
                            </h3>
                            <p className="text-muted-foreground max-w-md text-sm">
                                {report.error_message || 'An unexpected error occurred.'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                            <h3 className="text-foreground mb-1 text-lg font-medium">
                                Generating Report...
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                This may take 30-90 seconds.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-muted/50 shrink-0 border-t px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Stats */}
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            {report.processing_time_seconds && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatProcessingTime(report.processing_time_seconds)}
                                </span>
                            )}
                            {report.tokens_used && (
                                <span className="flex items-center gap-1">
                                    <Zap className="h-3.5 w-3.5" />
                                    {formatTokens(report.tokens_used)} tokens
                                </span>
                            )}
                            {report.research_enabled && (
                                <span className="text-primary">Research enabled</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {hasContent && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadMarkdown(report)}
                                >
                                    <Download className="mr-1 h-4 w-4" />
                                    Download
                                </Button>
                            )}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="mr-1 h-4 w-4" />
                                        )}
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete &ldquo;{report.title}
                                            &rdquo;? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onDelete(report.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
