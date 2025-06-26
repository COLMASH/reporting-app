'use client'

import { useFiles, useDeleteFile } from '../hooks/use-storage'
import type { UploadedFile } from '../types'
import { cn } from '@/lib/utils/cn'

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
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-8 text-center text-red-500">
                Failed to load files. Please try again.
            </div>
        )
    }

    if (files.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                No files uploaded yet. Upload your first file to get started!
            </div>
        )
    }

    return (
        <div className="ring-opacity-5 overflow-hidden rounded-lg shadow ring-1 ring-black">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {files.map(file => (
                        <tr key={file.id}>
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                {file.name}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                {formatFileSize(file.size)}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                {formatDate(file.uploadedAt)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mr-4 text-indigo-600 hover:text-indigo-900"
                                >
                                    View
                                </a>
                                <button
                                    onClick={() => handleDelete(file)}
                                    disabled={deleteFileMutation.isPending}
                                    className={cn(
                                        'text-red-600 hover:text-red-900',
                                        deleteFileMutation.isPending && 'opacity-50'
                                    )}
                                >
                                    {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
