'use client'

import { useState } from 'react'
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
import { Trash2, FileSpreadsheet, Loader2 } from 'lucide-react'
import { AnalysesDropdown } from '@/features/reporting-results/components/analyses-dropdown'
import { AnalysisResultsDialog } from '@/features/reporting-results/components/analysis-results-dialog'
import { CreateAnalysisDialog } from '@/features/reporting-results/components/create-analysis-dialog'
import { useAppDispatch } from '@/redux/hooks'
import { addActiveAnalysis } from '@/redux/features/activeAnalysesSlice'

export const FileList = () => {
    const { data, isLoading, error } = useGetFilesQuery()
    const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation()
    const files = data?.files || []
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

    if (isLoading) {
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

    if (files.length === 0) {
        return (
            <div className="text-muted-foreground px-4 py-8 text-center">
                No files uploaded yet. Upload your first Excel file to get started!
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead>
                        <tr className="border-border border-b">
                            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                File Name
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                Company
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                Classification
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                Size
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                Uploaded
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-center text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                Analyses
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider whitespace-nowrap uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                        {files.map(file => (
                            <tr key={file.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        <FileSpreadsheet className="text-muted-foreground mr-2 h-4 w-4 flex-shrink-0" />
                                        <p className="max-w-[200px] min-w-[150px] truncate text-sm font-medium">
                                            {file.original_filename}
                                        </p>
                                    </div>
                                </td>
                                <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                                    {file.company_name}
                                </td>
                                <td className="text-muted-foreground px-4 py-3 text-sm">
                                    <span className="bg-muted rounded-md px-2 py-1 text-xs">
                                        {getClassificationLabel(file.data_classification)}
                                    </span>
                                </td>
                                <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                                    {formatFileSize(file.file_size)}
                                </td>
                                <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                                    {formatDate(file.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <AnalysesDropdown
                                        fileId={file.id}
                                        onAnalysisSelect={analysis =>
                                            handleAnalysisSelect(analysis, file.original_filename)
                                        }
                                        onCreateAnalysis={() => handleCreateAnalysis(file)}
                                        refreshTrigger={refreshTrigger}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(file)}
                                            disabled={isDeleting}
                                            className={cn(
                                                'h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3',
                                                'text-destructive hover:text-destructive hover:bg-destructive/10',
                                                isDeleting && 'opacity-50'
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
