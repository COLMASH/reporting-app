import { z } from 'zod'

export type DataClassification =
    | 'portfolio'
    | 'operations'
    | 'project_management'
    | 'finance'
    | 'other'

export interface FileResponse {
    id: string
    filename: string
    original_filename: string
    file_size: number
    mime_type: string
    file_extension: string
    company_name: string
    data_classification?: DataClassification
    status: string
    created_at: string
    supabase_path: string
    anthropic_file_id?: string
}

export interface FileListResponse {
    files: FileResponse[]
    total: number
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
        .refine(file => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
        .refine(file => {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ]
            return allowedTypes.includes(file.type)
        }, 'Only Excel files (.xlsx, .xls) are allowed'),
    companyName: z.string().min(1, 'Company name is required'),
    dataClassification: z
        .enum(['portfolio', 'operations', 'project_management', 'finance', 'other'])
        .optional()
})

export type FileUploadData = z.infer<typeof fileUploadSchema>

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const ALLOWED_FILE_TYPES = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls']
}
