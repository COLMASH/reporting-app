import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadFile, listFiles, deleteFile } from '../services/storage'
import type { UploadedFile } from '../types'
import { toast } from 'sonner'

// Query keys
export const storageKeys = {
    all: ['storage'] as const,
    files: (userId: string) => [...storageKeys.all, 'files', userId] as const
}

// Hook to list files
export const useFiles = (userId: string) => {
    return useQuery({
        queryKey: storageKeys.files(userId),
        queryFn: () => listFiles(userId),
        enabled: !!userId,
        staleTime: 30 * 1000, // Consider data stale after 30 seconds
        gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes (formerly cacheTime)
    })
}

// Hook to upload file
export const useUploadFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            file,
            userId,
            onProgress
        }: {
            file: File
            userId: string
            onProgress?: (progress: number) => void
        }) => uploadFile(file, userId, onProgress),
        onSuccess: (_, variables) => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: storageKeys.files(variables.userId) })
            toast.success('File uploaded successfully')
        },
        onError: error => {
            // eslint-disable-next-line no-console
            console.error('Upload mutation error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to upload file')
        }
    })
}

// Hook to delete file
export const useDeleteFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ filePath }: { filePath: string; userId: string }) => deleteFile(filePath),
        onMutate: async ({ filePath, userId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: storageKeys.files(userId) })

            // Snapshot the previous value
            const previousFiles = queryClient.getQueryData<UploadedFile[]>(
                storageKeys.files(userId)
            )

            // Optimistically update to the new value
            if (previousFiles) {
                queryClient.setQueryData<UploadedFile[]>(
                    storageKeys.files(userId),
                    previousFiles.filter(file => file.id !== filePath)
                )
            }

            // Return a context object with the snapshotted value
            return { previousFiles, userId }
        },
        onError: (error, { userId }, context) => {
            // eslint-disable-next-line no-console
            console.error('Delete mutation error:', error)
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousFiles) {
                queryClient.setQueryData(storageKeys.files(userId), context.previousFiles)
            }
            toast.error('Failed to delete file')
        },
        onSuccess: (_, { userId }) => {
            toast.success('File deleted successfully')
            // Always refetch after error or success to ensure we're in sync
            queryClient.invalidateQueries({ queryKey: storageKeys.files(userId) })
        }
    })
}
