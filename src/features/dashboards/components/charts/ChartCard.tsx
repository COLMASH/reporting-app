'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChartCardProps } from './types'

export const ChartCard = ({
    title,
    description,
    icon: Icon,
    children,
    footer,
    badge,
    actions,
    onClick,
    loading = false,
    error = null,
    className
}: ChartCardProps & { children: React.ReactNode }) => {
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex h-[350px] items-center justify-center">
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                'flex flex-col transition-all',
                onClick && 'cursor-pointer hover:shadow-lg',
                className
            )}
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            {Icon && <Icon className="text-muted-foreground h-5 w-5" />}
                            {title}
                        </CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                        {badge}
                        {actions}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">{children}</CardContent>
            {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
    )
}
