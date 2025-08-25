'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FileText, TrendingUp, Coins, Rocket, Menu, X } from 'lucide-react'
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="bg-background border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Mobile menu button and title */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-primary inline-flex items-center justify-center rounded-md p-2 focus:ring-2 focus:outline-none focus:ring-inset lg:hidden"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                        <h2 className="ml-3 text-lg font-semibold lg:ml-0">Portfolio Dashboards</h2>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
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
                                        <span className="hidden xl:inline">{link.label}</span>
                                        <span className="xl:hidden">
                                            {link.label.split(' ')[0]}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Theme toggle */}
                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={cn('lg:hidden', isMobileMenuOpen ? 'block' : 'hidden')}>
                    <div className="space-y-1 px-2 pt-2 pb-3">
                        {dashboardLinks.map(link => {
                            const Icon = link.icon
                            const isActive = pathname === link.href

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors',
                                        {
                                            'bg-primary text-primary-foreground': isActive,
                                            'text-muted-foreground hover:text-foreground hover:bg-muted':
                                                !isActive
                                        }
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </nav>
    )
}
