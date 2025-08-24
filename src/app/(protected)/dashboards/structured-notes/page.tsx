import { StructuredNotesDashboard } from '@/features/dashboards/components/structured-notes-dashboard'

export default function StructuredNotesPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Structured Notes</h1>
                <p className="text-muted-foreground">Analysis of structured products and notes</p>
            </div>
            <StructuredNotesDashboard />
        </div>
    )
}
