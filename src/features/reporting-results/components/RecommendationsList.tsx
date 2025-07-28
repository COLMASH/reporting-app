'use client'

import { Lightbulb, Target } from 'lucide-react'
import { AnalysisResultCard } from './AnalysisResultCard'
import { cn } from '@/lib/utils'

interface RecommendationsListProps {
    recommendations: string[]
    className?: string
}

export const RecommendationsList = ({ recommendations, className }: RecommendationsListProps) => {
    return (
        <AnalysisResultCard
            title="Recommendations"
            description="Actionable insights to improve business performance"
            className={className}
        >
            <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                    <div
                        key={index}
                        className={cn(
                            'bg-muted/30 group hover:bg-muted/50 relative rounded-lg p-4 transition-all',
                            'border-primary border-l-4'
                        )}
                    >
                        <div className="flex gap-3">
                            <div className="text-primary mt-0.5 flex-shrink-0">
                                {index === 0 ? (
                                    <Target className="h-5 w-5" />
                                ) : (
                                    <Lightbulb className="h-5 w-5" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                        Recommendation {index + 1}
                                    </span>
                                    {index === 0 && (
                                        <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                            Priority
                                        </span>
                                    )}
                                </div>
                                <p className="text-foreground text-sm leading-relaxed">
                                    {recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AnalysisResultCard>
    )
}
