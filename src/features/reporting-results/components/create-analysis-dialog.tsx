'use client'

import { useState } from 'react'
import { useCreateAnalysisMutation } from '@/redux/services/reportingAnalysesApi'
import type { FileResponse } from '@/redux/services/filesApi'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, FileSpreadsheet } from 'lucide-react'

interface CreateAnalysisDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    file: FileResponse | null
    onAnalysisCreated?: (analysisId: string) => void
}

export const CreateAnalysisDialog = ({
    open,
    onOpenChange,
    file,
    onAnalysisCreated
}: CreateAnalysisDialogProps) => {
    const [focus, setFocus] = useState('')
    const [createAnalysis, { isLoading }] = useCreateAnalysisMutation()

    const handleSubmit = async () => {
        if (!file) return

        try {
            const result = await createAnalysis({
                file_id: file.id,
                parameters: focus.trim() ? { focus: focus.trim() } : undefined
            }).unwrap()

            toast.success('Analysis started successfully')
            onAnalysisCreated?.(result.id)
            onOpenChange(false)
            setFocus('')
        } catch (error) {
            // Error is handled by baseQuery
            // eslint-disable-next-line no-console
            console.error('Failed to create analysis:', error)
        }
    }

    const handleCancel = () => {
        setFocus('')
        onOpenChange(false)
    }

    if (!file) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Analysis</DialogTitle>
                    <DialogDescription>
                        Start a new analysis for your file. This process may take up to 5 minutes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="text-muted-foreground h-4 w-4" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">{file.original_filename}</p>
                                <p className="text-muted-foreground text-xs">
                                    {file.company_name} • {file.data_classification}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="focus">Analysis Focus (Optional)</Label>
                        <Textarea
                            id="focus"
                            placeholder="Enter specific areas or questions you want the analysis to focus on..."
                            value={focus}
                            onChange={e => setFocus(e.target.value)}
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-muted-foreground text-xs">
                            Provide any specific instructions or areas of focus for the analysis.
                            Leave empty for a comprehensive general analysis.
                        </p>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            The analysis will process your file using AI to generate insights and
                            recommendations. You&apos;ll be notified when it&apos;s complete, and
                            you can track its progress in the analyses list.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Start Analysis'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
