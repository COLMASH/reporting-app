import { z } from 'zod'

export type DataClassification =
    | 'portfolio'
    | 'operations'
    | 'project_management'
    | 'finance'
    | 'other'

export type FileStatus = 'uploaded' | 'processing' | 'completed' | 'failed'

export interface FileResponse {
    id: string
    filename: string
    original_filename: string
    file_size: number | null
    mime_type: string | null
    file_extension: string
    company_name: string
    data_classification?: DataClassification
    status: FileStatus
    created_at: string
    supabase_path: string
    anthropic_file_id?: string
}

export interface FileListResponse {
    files: FileResponse[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface FileListParams {
    page?: number
    pageSize?: number
}

export interface UploadFileRequest {
    file: File
    companyName: string
    dataClassification?: DataClassification
}

export type UploadFileResponse = FileResponse

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

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls']
}

export const fileUploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine(
            file => file.size <= MAX_FILE_SIZE,
            `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        )
        .refine(file => {
            const allowedTypes = Object.keys(ALLOWED_FILE_TYPES)
            return allowedTypes.includes(file.type)
        }, 'Only Excel files (.xlsx, .xls) are allowed'),
    companyName: z.string().min(1, 'Company name is required'),
    dataClassification: z
        .enum(['portfolio', 'operations', 'project_management', 'finance', 'other'])
        .optional()
})

export type FileUploadData = z.infer<typeof fileUploadSchema>
