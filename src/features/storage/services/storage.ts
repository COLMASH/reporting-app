import { supabase } from '@/lib/supabase-client'
import type { UploadedFile, StorageError } from '../types'

const BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'test-bucket'

const sanitizeFileName = (fileName: string): string => {
    // Remove path traversal attempts and special characters
    return fileName
        .replace(/\.\./g, '')
        .replace(/[\/\\]/g, '')
        .replace(/[^a-zA-Z0-9\-_.]/g, '_')
}

export const uploadFile = async (
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
): Promise<UploadedFile> => {
    try {
        const timestamp = Date.now()
        const sanitizedName = sanitizeFileName(file.name)
        const fileName = `${userId}/${timestamp}-${sanitizedName}`

        // Upload file to Supabase Storage
        // Note: Supabase doesn't provide built-in progress tracking
        // Call progress callback with 0 at start
        if (onProgress) {
            onProgress(0)
        }

        const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        })

        // Call progress callback with 100 on completion
        if (onProgress) {
            onProgress(100)
        }

        if (error) {
            throw error
        }

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

        const uploadedFile: UploadedFile = {
            id: data.path,
            name: file.name,
            size: file.size,
            type: file.type,
            url: urlData.publicUrl,
            uploadedAt: new Date().toISOString(),
            userId
        }

        return uploadedFile
    } catch (error) {
        const storageError: StorageError = {
            message: error instanceof Error ? error.message : 'Failed to upload file',
            code:
                error instanceof Error && 'code' in error
                    ? (error as Error & { code: string }).code
                    : undefined
        }
        throw storageError
    }
}

export const listFiles = async (userId: string): Promise<UploadedFile[]> => {
    try {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(userId, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
        })

        if (error) {
            throw error
        }

        if (!data) {
            return []
        }

        // Transform the file list into our UploadedFile format
        const files: UploadedFile[] = data.map(file => {
            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(`${userId}/${file.name}`)

            return {
                id: `${userId}/${file.name}`, // Full path needed for deletion
                name: file.name,
                size: file.metadata?.size || 0,
                type: file.metadata?.mimetype || 'unknown',
                url: urlData.publicUrl,
                uploadedAt: file.created_at || new Date().toISOString(),
                userId
            }
        })

        return files
    } catch (error) {
        const storageError: StorageError = {
            message: error instanceof Error ? error.message : 'Failed to list files',
            code:
                error instanceof Error && 'code' in error
                    ? (error as Error & { code: string }).code
                    : undefined
        }
        throw storageError
    }
}

export const deleteFile = async (filePath: string): Promise<void> => {
    try {
        const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

        if (error) {
            throw error
        }
    } catch (error) {
        const storageError: StorageError = {
            message: error instanceof Error ? error.message : 'Failed to delete file',
            code:
                error instanceof Error && 'code' in error
                    ? (error as Error & { code: string }).code
                    : undefined
        }
        throw storageError
    }
}

export const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return data.publicUrl
}

export const getSignedUrl = async (filePath: string, expiresIn = 3600): Promise<string> => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, expiresIn)

        if (error) {
            throw error
        }

        return data.signedUrl
    } catch (error) {
        const storageError: StorageError = {
            message: error instanceof Error ? error.message : 'Failed to create signed URL',
            code:
                error instanceof Error && 'code' in error
                    ? (error as Error & { code: string }).code
                    : undefined
        }
        throw storageError
    }
}
