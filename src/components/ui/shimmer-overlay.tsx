'use client'

/**
 * Shimmer overlay component for loading states.
 * Displays an animated shimmer effect over content during data fetching.
 */

import { cn } from '@/lib/utils'

export interface ShimmerOverlayProps {
    isActive: boolean
    className?: string
}

export const ShimmerOverlay = ({ isActive, className }: ShimmerOverlayProps) => {
    if (!isActive) return null

    return <div className={cn('shimmer-overlay', className)} aria-hidden="true" />
}
