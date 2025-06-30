'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useUploadFile } from '../hooks/use-storage'
import { fileUploadSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types'
import type { UploadProgress } from '../types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { Upload } from 'lucide-react'

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
                // eslint-disable-next-line no-console
                console.error('File upload error:', error)
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
                    'relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200 sm:p-6',
                    isDragActive
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-border hover:border-muted-foreground/50',
                    uploadFileMutation.isPending && 'cursor-not-allowed opacity-50'
                )}
            >
                <input {...getInputProps()} />

                <Upload className="text-muted-foreground mx-auto h-10 w-10 sm:h-12 sm:w-12" />

                <p className="text-foreground mt-2 text-sm sm:text-base">
                    {isDragActive
                        ? 'Drop the file here'
                        : 'Drag and drop a file here, or click to select'}
                </p>

                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    Supported: JPEG, PNG, GIF, PDF, Excel, CSV (max 10MB)
                </p>
            </div>

            {uploadProgress && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="max-w-[200px] truncate font-medium sm:max-w-none">
                            {uploadProgress.fileName}
                        </span>
                        <span className="text-muted-foreground">
                            {uploadProgress.status === 'uploading' && `${uploadProgress.progress}%`}
                            {uploadProgress.status === 'completed' && '✓ Completed'}
                            {uploadProgress.status === 'error' && '✗ Error'}
                        </span>
                    </div>

                    {uploadProgress.status === 'uploading' && (
                        <div className="bg-secondary mt-2 h-2 w-full rounded-full">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.progress}%` }}
                            />
                        </div>
                    )}

                    {uploadProgress.error && (
                        <p className="text-destructive mt-1 text-xs">{uploadProgress.error}</p>
                    )}
                </div>
            )}
        </div>
    )
}
