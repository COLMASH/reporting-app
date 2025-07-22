import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadFile, listFiles, deleteFile } from '../services/files-api'
import type { FileResponse, DataClassification } from '../types'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

// Query keys
export const storageKeys = {
    all: ['storage'] as const,
    files: () => [...storageKeys.all, 'files'] as const
}

// Hook to list files
export const useFiles = () => {
    const { data: session } = useSession()

    return useQuery({
        queryKey: storageKeys.files(),
        queryFn: async () => {
            if (!session?.accessToken) {
                throw new Error('No access token')
            }
            const response = await listFiles(session.accessToken)
            return response.files
        },
        enabled: !!session?.accessToken,
        staleTime: 30 * 1000, // Consider data stale after 30 seconds
        gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
    })
}

interface UploadFileParams {
    file: File
    companyName: string
    dataClassification?: DataClassification
}

// Hook to upload file
export const useUploadFile = () => {
    const queryClient = useQueryClient()
    const { data: session } = useSession()

    return useMutation({
        mutationFn: async ({ file, companyName, dataClassification }: UploadFileParams) => {
            if (!session?.accessToken) {
                throw new Error('No access token')
            }

            return uploadFile({
                file,
                companyName,
                dataClassification,
                token: session.accessToken
            })
        },
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: storageKeys.files() })
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
    const { data: session } = useSession()

    return useMutation({
        mutationFn: async (fileId: string) => {
            if (!session?.accessToken) {
                throw new Error('No access token')
            }
            return deleteFile(fileId, session.accessToken)
        },
        onMutate: async (fileId: string) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: storageKeys.files() })

            // Snapshot the previous value
            const previousFiles = queryClient.getQueryData<FileResponse[]>(storageKeys.files())

            // Optimistically update to the new value
            if (previousFiles) {
                queryClient.setQueryData<FileResponse[]>(
                    storageKeys.files(),
                    previousFiles.filter(file => file.id !== fileId)
                )
            }

            // Return a context object with the snapshotted value
            return { previousFiles }
        },
        onError: (error, _, context) => {
            // eslint-disable-next-line no-console
            console.error('Delete mutation error:', error)
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousFiles) {
                queryClient.setQueryData(storageKeys.files(), context.previousFiles)
            }
            toast.error('Failed to delete file')
        },
        onSuccess: () => {
            toast.success('File deleted successfully')
            // Always refetch after error or success to ensure we're in sync
            queryClient.invalidateQueries({ queryKey: storageKeys.files() })
        }
    })
}
