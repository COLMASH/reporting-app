'use client'

import { useState } from 'react'
import { AnalysisResults } from '@/features/reporting-results/components/AnalysisResults'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AnalysisPage() {
    // For testing, you can paste an analysis ID from your database
    const [analysisId, setAnalysisId] = useState('')
    const [showResults, setShowResults] = useState(false)

    const handleViewResults = () => {
        if (analysisId.trim()) {
            setShowResults(true)
        }
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4">
            <h1 className="text-3xl font-bold">Analysis Results Viewer</h1>

            {!showResults ? (
                <Card className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Enter Analysis ID to View Results
                    </h2>
                    <div className="flex gap-4">
                        <Input
                            placeholder="e.g., 27866c05-baa9-4a51-b23a-191875..."
                            value={analysisId}
                            onChange={e => setAnalysisId(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleViewResults} disabled={!analysisId.trim()}>
                            View Results
                        </Button>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Paste an analysis ID from your database to see the results
                    </p>
                </Card>
            ) : (
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-muted-foreground text-sm">Analysis ID: {analysisId}</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowResults(false)
                                setAnalysisId('')
                            }}
                        >
                            View Different Analysis
                        </Button>
                    </div>
                    <AnalysisResults analysisId={analysisId} />
                </div>
            )}
        </div>
    )
}
