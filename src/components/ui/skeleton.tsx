import { cn } from '@/lib/utils'

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
    return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />
}
