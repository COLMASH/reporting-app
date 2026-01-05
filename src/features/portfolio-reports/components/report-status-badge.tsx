'use client'

import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReportStatus } from '../types'

interface ReportStatusBadgeProps {
    status: ReportStatus
    className?: string
}

const STATUS_CONFIG: Record<
    ReportStatus,
    {
        label: string
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        icon: typeof Clock
        iconClassName: string
    }
> = {
    pending: {
        label: 'Pending',
        variant: 'secondary',
        icon: Clock,
        iconClassName: 'text-yellow-500'
    },
    in_progress: {
        label: 'Generating',
        variant: 'default',
        icon: Loader2,
        iconClassName: 'animate-spin'
    },
    completed: {
        label: 'Completed',
        variant: 'outline',
        icon: CheckCircle2,
        iconClassName: 'text-green-500'
    },
    failed: {
        label: 'Failed',
        variant: 'destructive',
        icon: XCircle,
        iconClassName: ''
    }
}

export const ReportStatusBadge = ({ status, className }: ReportStatusBadgeProps) => {
    // Normalize status to lowercase for consistent matching (handles API returning uppercase)
    const normalizedStatus = (status?.toLowerCase() || 'pending') as ReportStatus
    const config = STATUS_CONFIG[normalizedStatus]
    const Icon = config.icon

    return (
        <Badge variant={config.variant} className={cn('gap-1.5', className)}>
            <Icon className={cn('h-3 w-3', config.iconClassName)} />
            {config.label}
        </Badge>
    )
}
