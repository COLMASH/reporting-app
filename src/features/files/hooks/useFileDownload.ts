import { useState, useCallback } from 'react'
import { useLazyGetFileDownloadUrlQuery } from '@/redux/services/filesApi'
import { toast } from 'sonner'

interface UseFileDownloadReturn {
    downloadFile: (fileId: string, fileName: string) => Promise<void>
    isDownloading: string | null
    error: string | null
}

export function useFileDownload(): UseFileDownloadReturn {
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [triggerGetUrl] = useLazyGetFileDownloadUrlQuery()

    const downloadFile = useCallback(
        async (fileId: string, fileName: string) => {
            setIsDownloading(fileId)
            setError(null)

            try {
                // Step 1: Get signed URL from backend
                const urlResult = await triggerGetUrl({ fileId })

                if (urlResult.error) {
                    const errorMessage = 'Failed to get download URL from server'
                    setError(errorMessage)
                    toast.error(errorMessage)
                    return
                }

                if (!urlResult.data?.signed_url) {
                    const errorMessage = 'No download URL received'
                    setError(errorMessage)
                    toast.error(errorMessage)
                    return
                }

                // Step 2: Fetch file from Supabase
                const response = await fetch(urlResult.data.signed_url)
                if (!response.ok) {
                    const errorMessage = `Failed to download file: ${response.statusText}`
                    setError(errorMessage)
                    toast.error(errorMessage)
                    return
                }

                // Step 3: Convert to blob
                const blob = await response.blob()

                // Step 4: Create download link and trigger download
                const blobUrl = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = blobUrl
                link.download = fileName
                document.body.appendChild(link)
                link.click()

                // Step 5: Cleanup
                document.body.removeChild(link)
                window.URL.revokeObjectURL(blobUrl)

                toast.success(`Downloaded ${fileName}`)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Download failed'
                setError(errorMessage)
                toast.error(errorMessage)
                // eslint-disable-next-line no-console
                console.error('[File Download]', errorMessage, err)
            } finally {
                setIsDownloading(null)
            }
        },
        [triggerGetUrl]
    )

    return { downloadFile, isDownloading, error }
}
