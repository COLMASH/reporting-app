import { FileResponse, FileListResponse, DataClassification } from '@/features/storage/types'
import { getApiUrl } from '@/lib/utils/api-url'

const API_URL = getApiUrl()

interface UploadFileParams {
    file: File
    companyName: string
    dataClassification?: DataClassification
    token: string
}

export async function uploadFile({
    file,
    companyName,
    dataClassification,
    token
}: UploadFileParams): Promise<FileResponse> {
    try {
        const formData = new FormData()
        formData.append('file', file)

        // Build query parameters - backend expects these as query params
        const params = new URLSearchParams()
        params.append('company_name', companyName)
        if (dataClassification) {
            params.append('data_classification', dataClassification)
        }

        const response = await fetch(`${API_URL}/api/v1/files/upload?${params.toString()}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })

        if (!response.ok) {
            const error = await response.json()
            // eslint-disable-next-line no-console
            console.error('File upload failed:', {
                status: response.status,
                statusText: response.statusText,
                error: error.detail || 'Failed to upload file'
            })
            throw new Error(error.detail || 'Failed to upload file')
        }

        const data: FileResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected upload error:', error)
        throw new Error('An unexpected error occurred during upload')
    }
}

export async function listFiles(token: string): Promise<FileListResponse> {
    try {
        const response = await fetch(`${API_URL}/api/v1/files/`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            // eslint-disable-next-line no-console
            console.error('Failed to list files:', {
                status: response.status,
                statusText: response.statusText,
                error: error.detail || 'Failed to list files'
            })
            throw new Error(error.detail || 'Failed to list files')
        }

        const data: FileListResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected list files error:', error)
        throw new Error('Failed to fetch files')
    }
}

export async function deleteFile(fileId: string, token: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/api/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            // eslint-disable-next-line no-console
            console.error('Failed to delete file:', {
                status: response.status,
                statusText: response.statusText,
                error: error.detail || 'Failed to delete file'
            })
            throw new Error(error.detail || 'Failed to delete file')
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected delete error:', error)
        throw new Error('Failed to delete file')
    }
}

export async function getFileDetails(fileId: string, token: string): Promise<FileResponse> {
    try {
        const response = await fetch(`${API_URL}/api/v1/files/${fileId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            // eslint-disable-next-line no-console
            console.error('Failed to get file details:', {
                status: response.status,
                statusText: response.statusText,
                error: error.detail || 'Failed to get file details'
            })
            throw new Error(error.detail || 'Failed to get file details')
        }

        const data: FileResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected get file details error:', error)
        throw new Error('Failed to get file details')
    }
}
