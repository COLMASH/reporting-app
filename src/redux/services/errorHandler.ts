import { toast } from 'sonner'

export interface ApiError {
    status: number
    data?: {
        detail?: string
        message?: string
    }
}

export const handleApiError = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const apiError = error as ApiError

        // Handle specific status codes
        switch (apiError.status) {
            case 401:
                return 'Session expired. Please login again.'
            case 403:
                return 'You do not have permission to perform this action.'
            case 404:
                return 'The requested resource was not found.'
            case 413:
                return 'File size too large. Maximum size is 10MB.'
            case 422:
                return apiError.data?.detail || 'Invalid data provided.'
            case 429:
                return 'Too many requests. Please try again later.'
            case 500:
                return 'Server error. Please try again later.'
            case 529:
                return "Anthropic's API is temporarily overloaded. Please try again in a few moments."
            default:
                return apiError.data?.detail || apiError.data?.message || 'An error occurred.'
        }
    }

    return 'An unexpected error occurred.'
}

export const showApiError = (error: unknown): void => {
    const message = handleApiError(error)
    toast.error(message)
}
