import { z } from 'zod'

export interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    url: string
    uploadedAt: string
    userId: string
}

export interface UploadProgress {
    fileId: string
    fileName: string
    progress: number
    status: 'uploading' | 'completed' | 'error'
    error?: string
}

export interface StorageError {
    message: string
    code?: string
}

export const fileUploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
        .refine(file => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ]
            return allowedTypes.includes(file.type)
        }, 'File type not allowed. Allowed types: JPEG, PNG, GIF, PDF, Excel, CSV')
})

export type FileUploadData = z.infer<typeof fileUploadSchema>

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv']
}
