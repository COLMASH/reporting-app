/**
 * Get the appropriate API URL based on environment
 * Provides fallback when NEXT_PUBLIC_API_URL is not available
 */
export function getApiUrl(): string {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL
    }

    // Use production backend for production deployments
    if (process.env.NODE_ENV === 'production') {
        return 'https://reporting-app-back-prod.onrender.com'
    }

    // Use dev backend for all other environments
    return 'https://reporting-app-back-dev.onrender.com'
}
