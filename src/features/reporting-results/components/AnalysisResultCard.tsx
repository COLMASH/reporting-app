'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnalysisResultCardProps {
    title: string
    description?: string
    children: ReactNode
    className?: string
    contentClassName?: string
    actions?: ReactNode
}

export const AnalysisResultCard = ({
    title,
    description,
    children,
    className,
    contentClassName,
    actions
}: AnalysisResultCardProps) => {
    return (
        <div
            className={cn(
                'bg-card text-card-foreground border-border rounded-xl border shadow-sm transition-all hover:shadow-md',
                className
            )}
        >
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description && (
                        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <div className={cn('p-6', contentClassName)}>{children}</div>
        </div>
    )
}
