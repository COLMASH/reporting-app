'use client'

import { useState, useEffect } from 'react'
import {
    useGetFileAnalysesQuery,
    useDeleteAnalysisMutation
} from '@/redux/services/reportingAnalysesApi'
import { AnalysisResponse, AnalysisStatus } from '@/redux/services/reportingAnalysesApi'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    ChevronDown,
    FileSearch,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Ban,
    Trash2,
    Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch } from '@/redux/hooks'
import { removeActiveAnalysis } from '@/redux/features/activeAnalysesSlice'

interface AnalysesDropdownProps {
    fileId: string
    onAnalysisSelect: (analysis: AnalysisResponse) => void
    onCreateAnalysis?: () => void
    refreshTrigger?: number
}

const statusConfig: Record<
    AnalysisStatus,
    {
        label: string
        icon: React.ComponentType<{ className?: string }>
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        className?: string
    }
> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        variant: 'secondary',
        className: 'text-warning bg-warning/10 border-warning/20'
    },
    in_progress: {
        label: 'In Progress',
        icon: Loader2,
        variant: 'default',
        className: 'text-primary bg-primary/10 border-primary/20'
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        variant: 'default',
        className: 'text-success bg-success/10 border-success/20'
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        variant: 'destructive',
        className: 'text-destructive bg-destructive/10 border-destructive/20'
    },
    cancelled: {
        label: 'Cancelled',
        icon: Ban,
        variant: 'secondary',
        className: 'text-muted-foreground bg-muted border-muted-foreground/20'
    }
}

export const AnalysesDropdown = ({
    fileId,
    onAnalysisSelect,
    onCreateAnalysis,
    refreshTrigger
}: AnalysesDropdownProps) => {
    const [open, setOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [analysisToDelete, setAnalysisToDelete] = useState<AnalysisResponse | null>(null)
    const [deleteAnalysis, { isLoading: isDeleting }] = useDeleteAnalysisMutation()
    const dispatch = useAppDispatch()

    // Check if there are any active analyses
    const { data, isLoading, error } = useGetFileAnalysesQuery(fileId, {
        pollingInterval: 0, // We'll control polling manually
        refetchOnMountOrArgChange: true
    })

    // Set up polling for active analyses
    const hasActiveAnalyses = data?.analyses.some(
        a => a.status === 'pending' || a.status === 'in_progress'
    )

    // Poll every 5 seconds if there are active analyses
    const { refetch } = useGetFileAnalysesQuery(fileId, {
        pollingInterval: hasActiveAnalyses ? 5000 : undefined,
        skip: false
    })

    // Refetch when refreshTrigger changes (after creating new analysis)
    useEffect(() => {
        if (refreshTrigger) {
            refetch()
        }
    }, [refreshTrigger, refetch])

    const analyses = data?.analyses || []

    // Group analyses by status
    const activeAnalyses = analyses.filter(
        a => a.status === 'pending' || a.status === 'in_progress'
    )
    const completedAnalyses = analyses.filter(a => a.status === 'completed')
    const failedAnalyses = analyses.filter(a => a.status === 'failed' || a.status === 'cancelled')

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTimeElapsed = (startTime: string): string => {
        // Trim microseconds if present (keep only up to milliseconds)
        let normalizedTime = startTime
        const dotIndex = startTime.indexOf('.')
        if (dotIndex !== -1) {
            // Keep only 3 digits after the decimal point for milliseconds
            normalizedTime = startTime.substring(0, dotIndex + 4)
        }

        // Ensure the timestamp is treated as UTC by appending 'Z' if not present
        const utcTime = normalizedTime + 'Z'

        const start = new Date(utcTime)
        const now = new Date()
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000)

        // Handle invalid dates or negative differences
        if (isNaN(start.getTime()) || diff < 0) {
            return '0s'
        }

        if (diff < 60) return `${diff}s`
        if (diff < 3600) return `${Math.floor(diff / 60)}m`
        return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
    }

    const handleViewClick = (e: React.MouseEvent, analysis: AnalysisResponse) => {
        e.stopPropagation()
        if (analysis.status === 'completed') {
            onAnalysisSelect(analysis)
            setOpen(false)
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, analysis: AnalysisResponse) => {
        e.stopPropagation()
        setAnalysisToDelete(analysis)
        setDeleteDialogOpen(true)
        setOpen(false)
    }

    const handleConfirmDelete = async () => {
        if (!analysisToDelete) return

        try {
            await deleteAnalysis(analysisToDelete.id).unwrap()
            toast.success('Analysis deleted successfully')

            // Clean up from active analyses if it was tracked
            dispatch(removeActiveAnalysis(analysisToDelete.id))

            setDeleteDialogOpen(false)
            setAnalysisToDelete(null)
            refetch()
        } catch (error) {
            // Error is handled by baseQuery
            // eslint-disable-next-line no-console
            console.error('Failed to delete analysis:', error)
        }
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setAnalysisToDelete(null)
    }

    const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
        const config = statusConfig[status]
        const Icon = config.icon

        return (
            <Badge
                variant={config.variant}
                className={cn('shrink-0 gap-1 text-xs', config.className)}
            >
                <Icon
                    className={cn(
                        'h-3 w-3 shrink-0',
                        status === 'in_progress' && 'animate-spin',
                        'text-inherit'
                    )}
                />
                {config.label}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-2">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
        )
    }

    if (error) {
        return <span className="text-destructive text-xs">Error loading analyses</span>
    }

    const totalCount = analyses.length
    const buttonLabel =
        totalCount === 0
            ? 'No analyses'
            : `${totalCount} ${totalCount === 1 ? 'analysis' : 'analyses'}`

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'h-8 w-full justify-between px-2 text-xs',
                            'hover:bg-muted/50'
                        )}
                    >
                        <span className="flex items-center gap-1">
                            {hasActiveAnalyses ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <FileSearch className="h-3 w-3" />
                            )}
                            {buttonLabel}
                        </span>
                        <ChevronDown
                            className={cn('h-3 w-3 transition-transform', {
                                'rotate-180': open
                            })}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] sm:w-96">
                    <div className="flex items-center justify-between px-2 py-1.5">
                        <DropdownMenuLabel className="p-0">All Analyses</DropdownMenuLabel>
                        {onCreateAnalysis && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    onCreateAnalysis()
                                    setOpen(false)
                                }}
                                className="h-7 px-2 text-xs"
                            >
                                New Analysis
                            </Button>
                        )}
                    </div>
                    <DropdownMenuSeparator />

                    {analyses.length === 0 ? (
                        <div className="text-muted-foreground p-4 text-center text-sm">
                            No analyses yet
                            {onCreateAnalysis && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => {
                                        onCreateAnalysis()
                                        setOpen(false)
                                    }}
                                    className="mt-2 block w-full"
                                >
                                    Create your first analysis
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-x-hidden overflow-y-auto">
                            {activeAnalyses.length > 0 && (
                                <>
                                    <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
                                        Active
                                    </div>
                                    {activeAnalyses.map(analysis => (
                                        <DropdownMenuItem
                                            key={analysis.id}
                                            className="py-2"
                                            onSelect={e => e.preventDefault()}
                                        >
                                            <div className="flex w-full min-w-0 flex-col gap-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <StatusBadge status={analysis.status} />
                                                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                                        <Clock className="h-3 w-3" />
                                                        {getTimeElapsed(analysis.created_at)}
                                                    </span>
                                                </div>
                                                <span className="truncate text-xs">
                                                    Started {formatDate(analysis.created_at)}
                                                </span>
                                                {analysis.parameters?.focus && (
                                                    <span className="text-muted-foreground line-clamp-1 text-xs">
                                                        {analysis.parameters.focus}
                                                    </span>
                                                )}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {completedAnalyses.length > 0 && (
                                <>
                                    <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
                                        Completed
                                    </div>
                                    {completedAnalyses.map(analysis => (
                                        <div key={analysis.id} className="px-2 py-2">
                                            <div className="flex w-full items-center gap-2">
                                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={analysis.status} />
                                                        <span className="truncate text-xs">
                                                            {formatDate(
                                                                analysis.completed_at ||
                                                                    analysis.created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                    {analysis.parameters?.focus && (
                                                        <span className="text-muted-foreground line-clamp-1 text-xs">
                                                            {analysis.parameters.focus}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={e => handleViewClick(e, analysis)}
                                                        title="View results"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            View results
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                        onClick={e =>
                                                            handleDeleteClick(e, analysis)
                                                        }
                                                        title="Delete analysis"
                                                    >
                                                        <Trash2 className="text-destructive h-4 w-4" />
                                                        <span className="sr-only">
                                                            Delete analysis
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {failedAnalyses.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
                                        Failed/Cancelled
                                    </div>
                                    {failedAnalyses.map(analysis => (
                                        <div key={analysis.id} className="px-2 py-2">
                                            <div className="flex w-full items-center gap-2">
                                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={analysis.status} />
                                                        <span className="text-muted-foreground truncate text-xs">
                                                            {formatDate(analysis.created_at)}
                                                        </span>
                                                    </div>
                                                    {analysis.error_message && (
                                                        <span className="text-destructive line-clamp-1 text-xs">
                                                            {analysis.error_message}
                                                        </span>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                    onClick={e => handleDeleteClick(e, analysis)}
                                                    title="Delete analysis"
                                                >
                                                    <Trash2 className="text-destructive h-4 w-4" />
                                                    <span className="sr-only">Delete analysis</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Analysis</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this analysis? This action cannot be
                            undone.
                            {analysisToDelete?.parameters?.focus && (
                                <span className="mt-2 block text-sm">
                                    <strong>Focus:</strong> {analysisToDelete.parameters.focus}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
