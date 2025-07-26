'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useUploadFileMutation } from '@/redux/services/filesApi'
import {
    fileUploadSchema,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    type DataClassification
} from '@/redux/services/filesApi'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const COMPANY_OPTIONS = ['ILV', 'Dovela', 'Pivert'] as const

export const FileUpload = () => {
    const [companyName, setCompanyName] = useState('')
    const [dataClassification, setDataClassification] = useState<DataClassification | ''>('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()

    const handleFileUpload = useCallback(async () => {
        if (!selectedFile || !companyName) {
            toast.error('Please select a file and company name')
            return
        }

        try {
            // Validate file
            const validationResult = fileUploadSchema.safeParse({
                file: selectedFile,
                companyName,
                dataClassification: dataClassification || undefined
            })

            if (!validationResult.success) {
                throw new Error(validationResult.error.errors[0].message)
            }

            await uploadFile({
                file: selectedFile,
                companyName,
                dataClassification: dataClassification || undefined
            }).unwrap()

            // Reset form on successful upload
            toast.success('File uploaded successfully')
            setSelectedFile(null)
            setCompanyName('')
            setDataClassification('')
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('File upload error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
            toast.error(errorMessage)
        }
    }, [selectedFile, companyName, dataClassification, uploadFile])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ALLOWED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        maxFiles: 1,
        disabled: isUploading
    })

    return (
        <div className="w-full space-y-4">
            <div>
                <Label htmlFor="company-name" className="mb-2">
                    Company Name *
                </Label>
                <Select value={companyName} onValueChange={setCompanyName} disabled={isUploading}>
                    <SelectTrigger id="company-name">
                        <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                        {COMPANY_OPTIONS.map(company => (
                            <SelectItem key={company} value={company}>
                                {company}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="data-classification" className="mb-2">
                    Data Classification (Optional)
                </Label>
                <Select
                    value={dataClassification}
                    onValueChange={value => setDataClassification(value as DataClassification | '')}
                    disabled={isUploading}
                >
                    <SelectTrigger id="data-classification">
                        <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="project_management">Project Management</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Upload Excel File *</Label>
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative mt-1 cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200 sm:p-6',
                        isDragActive
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-border hover:border-muted-foreground/50',
                        isUploading && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <input {...getInputProps()} />

                    <Upload className="text-muted-foreground mx-auto h-10 w-10 sm:h-12 sm:w-12" />

                    <p className="text-foreground mt-2 text-sm sm:text-base">
                        {isDragActive
                            ? 'Drop the Excel file here'
                            : selectedFile
                              ? `Selected: ${selectedFile.name}`
                              : 'Drag and drop an Excel file here, or click to select'}
                    </p>

                    <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                        Only Excel files (.xlsx, .xls) up to {MAX_FILE_SIZE / (1024 * 1024)}MB
                    </p>
                </div>
            </div>

            {selectedFile && companyName && (
                <Button onClick={handleFileUpload} disabled={isUploading} className="w-full">
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
            )}
        </div>
    )
}
