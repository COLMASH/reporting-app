'use client'

import { FileUpload } from '@/features/storage/components/file-upload'
import { FileList } from '@/features/storage/components/file-list'
import { Toaster } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const StorageDashboard = () => {
    return (
        <>
            <Toaster position="top-right" theme="system" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">File Upload</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Upload Excel files for analysis. Supported formats: .xlsx, .xls (max
                            10MB)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileUpload />
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
                        <FileList />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
