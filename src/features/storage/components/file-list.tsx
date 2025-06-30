'use client'

import { useFiles, useDeleteFile } from '../hooks/use-storage'
import type { UploadedFile } from '../types'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Trash2, ExternalLink, Loader2 } from 'lucide-react'

interface FileListProps {
    userId: string
}

export const FileList = ({ userId }: FileListProps) => {
    const { data: files = [], isLoading, error } = useFiles(userId)
    const deleteFileMutation = useDeleteFile()

    const handleDelete = (file: UploadedFile) => {
        if (!confirm(`Are you sure you want to delete ${file.name}?`)) {
            return
        }

        deleteFileMutation.mutate({ filePath: file.id, userId })
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
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
                No files uploaded yet. Upload your first file to get started!
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-border border-b">
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                            File Name
                        </th>
                        <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-medium tracking-wider uppercase sm:table-cell">
                            Size
                        </th>
                        <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-medium tracking-wider uppercase md:table-cell">
                            Uploaded
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-border divide-y">
                    {files.map(file => (
                        <tr key={file.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3">
                                <div>
                                    <p className="max-w-[200px] truncate text-sm font-medium sm:max-w-[300px] md:max-w-none">
                                        {file.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs sm:hidden">
                                        {formatFileSize(file.size)}
                                    </p>
                                    <p className="text-muted-foreground text-xs md:hidden">
                                        {formatDate(file.uploadedAt)}
                                    </p>
                                </div>
                            </td>
                            <td className="text-muted-foreground hidden px-4 py-3 text-sm sm:table-cell">
                                {formatFileSize(file.size)}
                            </td>
                            <td className="text-muted-foreground hidden px-4 py-3 text-sm md:table-cell">
                                {formatDate(file.uploadedAt)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1 sm:gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                                        asChild
                                    >
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View file"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="ml-2 hidden sm:inline">View</span>
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(file)}
                                        disabled={deleteFileMutation.isPending}
                                        className={cn(
                                            'h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3',
                                            'text-destructive hover:text-destructive hover:bg-destructive/10',
                                            deleteFileMutation.isPending && 'opacity-50'
                                        )}
                                        title="Delete file"
                                    >
                                        {deleteFileMutation.isPending ? (
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
    )
}
