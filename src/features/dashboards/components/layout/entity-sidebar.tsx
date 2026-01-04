'use client'

/**
 * Holding company filter sidebar for portfolio dashboard.
 * Shows all holding companies with a "Consolidated View" option at the top.
 * Responsive: Fixed sidebar on desktop, Sheet drawer on mobile.
 */

import { useState } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle2, Menu, Bot } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes'

export interface EntitySidebarProps {
    holdingCompanies: string[]
    selectedHoldingCompany: string | null
    onHoldingCompanyChange: (holdingCompany: string | null) => void
    isLoading?: boolean
}

interface SidebarContentProps {
    holdingCompanies: string[]
    selectedHoldingCompany: string | null
    onHoldingCompanyChange: (holdingCompany: string | null) => void
    onSelect?: () => void
}

const SidebarSkeleton = () => (
    <div className="flex h-full flex-col">
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
        {/* AI Reports skeleton */}
        <div className="mt-auto border-t p-2">
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
)

const SidebarContent = ({
    holdingCompanies,
    selectedHoldingCompany,
    onHoldingCompanyChange,
    onSelect
}: SidebarContentProps) => {
    const isConsolidated = selectedHoldingCompany === null

    const handleSelect = (holdingCompany: string | null) => {
        onHoldingCompanyChange(holdingCompany)
        onSelect?.()
    }

    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-4">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                    Company Filter
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                    {holdingCompanies.length} companies
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
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

                {/* Individual Companies */}
                <div className="space-y-1">
                    {holdingCompanies.map(company => {
                        const isSelected = selectedHoldingCompany === company
                        return (
                            <button
                                key={company}
                                onClick={() => handleSelect(company)}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                                    {
                                        'bg-primary text-primary-foreground font-medium':
                                            isSelected,
                                        'hover:bg-muted/50': !isSelected
                                    }
                                )}
                            >
                                <span className="flex-1 truncate text-left">{company}</span>
                                {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* AI Reports Link */}
            <div className="border-t p-2">
                <Link
                    href={ROUTES.PORTFOLIO_REPORTS}
                    onClick={() => onSelect?.()}
                    className="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                >
                    <Bot className="h-4 w-4" />
                    <span>AI Reports</span>
                </Link>
            </div>
        </div>
    )
}

export const EntitySidebar = ({
    holdingCompanies,
    selectedHoldingCompany,
    onHoldingCompanyChange,
    isLoading = false
}: EntitySidebarProps) => {
    // Desktop sidebar - hidden on mobile
    return (
        <aside className="bg-background hidden h-full w-60 shrink-0 border-r lg:block">
            {isLoading ? (
                <SidebarSkeleton />
            ) : (
                <SidebarContent
                    holdingCompanies={holdingCompanies}
                    selectedHoldingCompany={selectedHoldingCompany}
                    onHoldingCompanyChange={onHoldingCompanyChange}
                />
            )}
        </aside>
    )
}

// Mobile sidebar trigger and drawer
export const MobileEntitySidebar = ({
    holdingCompanies,
    selectedHoldingCompany,
    onHoldingCompanyChange,
    isLoading = false
}: EntitySidebarProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open company filter</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Company Filter</SheetTitle>
                </SheetHeader>
                {isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <SidebarContent
                        holdingCompanies={holdingCompanies}
                        selectedHoldingCompany={selectedHoldingCompany}
                        onHoldingCompanyChange={onHoldingCompanyChange}
                        onSelect={() => setIsOpen(false)}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}
