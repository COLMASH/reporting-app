'use client'

import { useState, useMemo, useCallback } from 'react'
import { useGetFilesQuery, useDeleteFileMutation } from '@/redux/services/filesApi'
import type { FileResponse } from '@/redux/services/filesApi'
import type { AnalysisResponse } from '@/redux/services/reportingAnalysesApi'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination'
import { Trash2, FileSpreadsheet, Loader2 } from 'lucide-react'
import { AnalysesDropdown } from '@/features/reporting-results/components/analyses-dropdown'
import { AnalysisResultsDialog } from '@/features/reporting-results/components/analysis-results-dialog'
import { CreateAnalysisDialog } from '@/features/reporting-results/components/create-analysis-dialog'
import { useAppDispatch } from '@/redux/hooks'
import { addActiveAnalysis } from '@/redux/features/activeAnalysesSlice'

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const
const DEFAULT_PAGE_SIZE = 5

export const FileList = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

    const { data, isLoading, error } = useGetFilesQuery({
        page: currentPage,
        pageSize
    })

    const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation()
    const files = data?.files || []
    const totalPages = data?.total_pages || 0

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<FileResponse | null>(null)
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResponse | null>(null)
    const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined)
    const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false)
    const [createAnalysisOpen, setCreateAnalysisOpen] = useState(false)
    const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState<FileResponse | null>(
        null
    )
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const dispatch = useAppDispatch()

    const handleDeleteClick = (file: FileResponse) => {
        setFileToDelete(file)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (fileToDelete) {
            try {
                await deleteFile(fileToDelete.id).unwrap()
                toast.success('File deleted successfully')
                setDeleteDialogOpen(false)
                setFileToDelete(null)

                // If current page is empty after deletion, go to previous page
                if (files.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1)
                }
            } catch (error) {
                // Error is already handled by baseQuery
                // eslint-disable-next-line no-console
                console.error('Delete error:', error)
            }
        }
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setFileToDelete(null)
    }

    const handleAnalysisSelect = (analysis: AnalysisResponse, fileName: string) => {
        setSelectedAnalysis(analysis)
        setSelectedFileName(fileName)
        setAnalysisDialogOpen(true)
    }

    const handleCreateAnalysis = (file: FileResponse) => {
        setSelectedFileForAnalysis(file)
        setCreateAnalysisOpen(true)
    }

    const handleAnalysisCreated = (analysisId: string) => {
        dispatch(addActiveAnalysis(analysisId))
        setRefreshTrigger(prev => prev + 1)
    }

    const handlePageChange = useCallback(
        (page: number) => {
            if (page >= 1 && page <= totalPages) {
                setCurrentPage(page)
            }
        },
        [totalPages]
    )

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1) // Reset to first page when changing page size
    }

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes || bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string): string => {
        // Ensure the timestamp is interpreted as UTC if it doesn't have timezone info
        const date = new Date(
            dateString.includes('Z') || dateString.includes('+') ? dateString : dateString + 'Z'
        )
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short'
        })
    }

    const getClassificationLabel = (classification?: string): string => {
        if (!classification) return 'N/A'
        return classification
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const paginationItems = useMemo(() => {
        const items = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={currentPage === i}
                            className="cursor-pointer select-none"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                )
            }
        } else {
            // Always show first page
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={() => handlePageChange(1)}
                        isActive={currentPage === 1}
                        className="cursor-pointer select-none"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            )

            // Show ellipsis if needed
            if (currentPage > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                )
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={currentPage === i}
                            className="cursor-pointer select-none"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                )
            }

            // Show ellipsis if needed
            if (currentPage < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                )
            }

            // Always show last page
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        isActive={currentPage === totalPages}
                        className="cursor-pointer select-none"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            )
        }

        return items
    }, [currentPage, totalPages, handlePageChange])

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-destructive py-8 text-center">
                Failed to load files. Please try again.
            </div>
        )
    }

    if (!data || files.length === 0) {
        return (
            <div className="text-muted-foreground px-4 py-8 text-center">
                No files uploaded yet. Upload your first Excel file to get started!
            </div>
        )
    }

    return (
        <>
            <div className="relative space-y-4">
                {/* Loading overlay for page changes */}
                {isLoading && data && (
                    <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center rounded-lg">
                        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Classification</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-center">Analyses</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map(file => (
                            <TableRow key={file.id}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <FileSpreadsheet className="text-muted-foreground mr-2 h-4 w-4 flex-shrink-0" />
                                        <p className="max-w-[200px] min-w-[150px] truncate text-sm font-medium">
                                            {file.original_filename}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {file.company_name}
                                </TableCell>
                                <TableCell>
                                    <span className="bg-muted rounded-md px-2 py-1 text-xs">
                                        {getClassificationLabel(file.data_classification)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatFileSize(file.file_size)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(file.created_at)}
                                </TableCell>
                                <TableCell>
                                    <AnalysesDropdown
                                        fileId={file.id}
                                        onAnalysisSelect={analysis =>
                                            handleAnalysisSelect(analysis, file.original_filename)
                                        }
                                        onCreateAnalysis={() => handleCreateAnalysis(file)}
                                        refreshTrigger={refreshTrigger}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(file)}
                                            disabled={isDeleting}
                                            className={cn(
                                                'h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3',
                                                'text-destructive hover:text-destructive hover:bg-destructive/10',
                                                {
                                                    'opacity-50': isDeleting
                                                }
                                            )}
                                            title="Delete file"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="ml-2 hidden sm:inline">
                                                        Delete
                                                    </span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 px-4">
                        <label
                            htmlFor="page-size"
                            className="text-muted-foreground text-sm whitespace-nowrap"
                        >
                            Show records:
                        </label>
                        <select
                            id="page-size"
                            value={pageSize}
                            onChange={e => handlePageSizeChange(Number(e.target.value))}
                            className="border-input bg-background h-8 w-16 cursor-pointer rounded-md border px-2 text-sm"
                            aria-label="Page size selector"
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Pagination
                        className="mx-0 w-auto justify-center sm:justify-end"
                        aria-label="Pagination navigation"
                    >
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={cn(
                                        'cursor-pointer select-none',
                                        currentPage === 1 &&
                                            'pointer-events-none cursor-default opacity-50'
                                    )}
                                />
                            </PaginationItem>
                            {paginationItems}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={cn(
                                        'cursor-pointer select-none',
                                        currentPage === totalPages &&
                                            'pointer-events-none cursor-default opacity-50'
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete file</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;{fileToDelete?.original_filename}
                            &rdquo;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelDelete}>
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

            <AnalysisResultsDialog
                open={analysisDialogOpen}
                onOpenChange={setAnalysisDialogOpen}
                analysis={selectedAnalysis}
                fileName={selectedFileName}
            />

            <CreateAnalysisDialog
                open={createAnalysisOpen}
                onOpenChange={setCreateAnalysisOpen}
                file={selectedFileForAnalysis}
                onAnalysisCreated={handleAnalysisCreated}
            />
        </>
    )
}
