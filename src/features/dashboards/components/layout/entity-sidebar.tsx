'use client'

/**
 * Entity filter sidebar for portfolio dashboard.
 * Shows all entities with a "Consolidated View" option at the top.
 * Responsive: Fixed sidebar on desktop, Sheet drawer on mobile.
 */

import { useState } from 'react'
import { Building2, CheckCircle2, Menu } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface EntitySidebarProps {
    entities: string[]
    selectedEntity: string | null
    onEntityChange: (entity: string | null) => void
    isLoading?: boolean
}

interface SidebarContentProps {
    entities: string[]
    selectedEntity: string | null
    onEntityChange: (entity: string | null) => void
    onSelect?: () => void
}

const SidebarSkeleton = () => (
    <div className="p-4">
        <div className="mb-4">
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
    </div>
)

const SidebarContent = ({
    entities,
    selectedEntity,
    onEntityChange,
    onSelect
}: SidebarContentProps) => {
    const isConsolidated = selectedEntity === null

    const handleSelect = (entity: string | null) => {
        onEntityChange(entity)
        onSelect?.()
    }

    return (
        <>
            <div className="border-b p-4">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                    Entity Filter
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">{entities.length} entities</p>
            </div>

            <nav className="p-2">
                {/* Consolidated View Option */}
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        {
                            'bg-primary text-primary-foreground': isConsolidated,
                            'hover:bg-muted': !isConsolidated
                        }
                    )}
                >
                    <Building2 className="h-4 w-4" />
                    <span className="flex-1 text-left">Consolidated View</span>
                    {isConsolidated && <CheckCircle2 className="h-4 w-4" />}
                </button>

                <div className="my-2 border-t" />

                {/* Individual Entities */}
                <div className="space-y-1">
                    {entities.map(entity => {
                        const isSelected = selectedEntity === entity
                        return (
                            <button
                                key={entity}
                                onClick={() => handleSelect(entity)}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                                    {
                                        'bg-primary text-primary-foreground font-medium':
                                            isSelected,
                                        'hover:bg-muted/50': !isSelected
                                    }
                                )}
                            >
                                <span className="flex-1 truncate text-left">{entity}</span>
                                {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}

export const EntitySidebar = ({
    entities,
    selectedEntity,
    onEntityChange,
    isLoading = false
}: EntitySidebarProps) => {
    // Desktop sidebar - hidden on mobile
    return (
        <aside className="bg-background hidden w-60 shrink-0 border-r lg:block">
            {isLoading ? (
                <SidebarSkeleton />
            ) : (
                <SidebarContent
                    entities={entities}
                    selectedEntity={selectedEntity}
                    onEntityChange={onEntityChange}
                />
            )}
        </aside>
    )
}

// Mobile sidebar trigger and drawer
export const MobileEntitySidebar = ({
    entities,
    selectedEntity,
    onEntityChange,
    isLoading = false
}: EntitySidebarProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open entity filter</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Entity Filter</SheetTitle>
                </SheetHeader>
                {isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <SidebarContent
                        entities={entities}
                        selectedEntity={selectedEntity}
                        onEntityChange={onEntityChange}
                        onSelect={() => setIsOpen(false)}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}
