'use client'

import { FileUpload } from '@/features/storage/components/file-upload'
import { FileList } from '@/features/storage/components/file-list'
import { Toaster } from 'sonner'

interface StorageDashboardProps {
    userId: string
}

export const StorageDashboard = ({ userId }: StorageDashboardProps) => {
    return (
        <>
            <Toaster position="top-right" />

            <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                <div className="border-b border-gray-200 pb-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">File Upload</h3>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500">
                        Upload and manage your files. Supported formats: JPEG, PNG, GIF, PDF, Excel,
                        CSV (max 10MB)
                    </p>
                </div>

                <div className="mt-6">
                    <FileUpload userId={userId} />
                </div>
            </div>

            <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                <div className="border-b border-gray-200 pb-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Your Files</h3>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500">
                        View and manage your uploaded files
                    </p>
                </div>

                <div className="mt-6">
                    <FileList userId={userId} />
                </div>
            </div>
        </>
    )
}
