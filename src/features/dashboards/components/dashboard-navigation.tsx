'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FileText, TrendingUp, Coins, Rocket } from 'lucide-react'
import { ThemeToggle } from '@/components/common/theme-toggle'

const dashboardLinks = [
    {
        href: '/dashboards',
        label: 'Overview',
        icon: LayoutDashboard
    },
    {
        href: '/dashboards/structured-notes',
        label: 'Structured Notes',
        icon: FileText
    },
    {
        href: '/dashboards/equities',
        label: 'Equities',
        icon: TrendingUp
    },
    {
        href: '/dashboards/alternatives',
        label: 'Alternative Investments',
        icon: Rocket
    },
    {
        href: '/dashboards/commodities',
        label: 'Commodities',
        icon: Coins
    }
]

export const DashboardNavigation = () => {
    const pathname = usePathname()

    return (
        <nav className="bg-background border-b">
            <div className="container mx-auto">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <h2 className="text-lg font-semibold">Portfolio Dashboards</h2>
                        <div className="flex space-x-1">
                            {dashboardLinks.map(link => {
                                const Icon = link.icon
                                const isActive = pathname === link.href

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                            {
                                                'bg-primary text-primary-foreground': isActive,
                                                'text-muted-foreground hover:text-foreground hover:bg-muted':
                                                    !isActive
                                            }
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}
