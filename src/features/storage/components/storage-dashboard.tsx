'use client'

import { FileUpload } from '@/features/storage/components/file-upload'
import { FileList } from '@/features/storage/components/file-list'
import { Toaster } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StorageDashboardProps {
    userId: string
}

export const StorageDashboard = ({ userId }: StorageDashboardProps) => {
    return (
        <>
            <Toaster position="top-right" theme="system" />

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">File Upload</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Upload and manage your files. Supported formats: JPEG, PNG, GIF, PDF, Excel,
                        CSV (max 10MB)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUpload userId={userId} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Your Files</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        View and manage your uploaded files
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <FileList userId={userId} />
                </CardContent>
            </Card>
        </>
    )
}
