'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useUploadFile } from '../hooks/use-storage'
import { fileUploadSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types'
import type { UploadProgress } from '../types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface FileUploadProps {
    userId: string
}

export const FileUpload = ({ userId }: FileUploadProps) => {
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
    const uploadFileMutation = useUploadFile()

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!userId) {
                toast.error('You must be logged in to upload files')
                return
            }

            try {
                // Validate file
                const validationResult = fileUploadSchema.safeParse({ file })
                if (!validationResult.success) {
                    throw new Error(validationResult.error.errors[0].message)
                }

                setUploadProgress({
                    fileId: `temp-${Date.now()}`,
                    fileName: file.name,
                    progress: 0,
                    status: 'uploading'
                })

                await uploadFileMutation.mutateAsync({
                    file,
                    userId,
                    onProgress: progress => {
                        setUploadProgress(prev => (prev ? { ...prev, progress } : null))
                    }
                })

                setUploadProgress(prev =>
                    prev ? { ...prev, progress: 100, status: 'completed' } : null
                )
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Failed to upload file'
                setUploadProgress(prev =>
                    prev ? { ...prev, status: 'error', error: errorMessage } : null
                )
            } finally {
                setTimeout(() => setUploadProgress(null), 3000)
            }
        },
        [userId, uploadFileMutation]
    )

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                handleFileUpload(acceptedFiles[0])
            }
        },
        [handleFileUpload]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ALLOWED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        maxFiles: 1,
        disabled: uploadFileMutation.isPending
    })

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={cn(
                    'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200',
                    isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400',
                    uploadFileMutation.isPending && 'cursor-not-allowed opacity-50'
                )}
            >
                <input {...getInputProps()} />

                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                >
                    <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <p className="mt-2 text-sm text-gray-600">
                    {isDragActive
                        ? 'Drop the file here'
                        : 'Drag and drop a file here, or click to select'}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    Supported: JPEG, PNG, GIF, PDF, Excel, CSV (max 10MB)
                </p>
            </div>

            {uploadProgress && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{uploadProgress.fileName}</span>
                        <span className="text-gray-500">
                            {uploadProgress.status === 'uploading' && `${uploadProgress.progress}%`}
                            {uploadProgress.status === 'completed' && '✓ Completed'}
                            {uploadProgress.status === 'error' && '✗ Error'}
                        </span>
                    </div>

                    {uploadProgress.status === 'uploading' && (
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${uploadProgress.progress}%` }}
                            />
                        </div>
                    )}

                    {uploadProgress.error && (
                        <p className="mt-1 text-xs text-red-600">{uploadProgress.error}</p>
                    )}
                </div>
            )}
        </div>
    )
}
