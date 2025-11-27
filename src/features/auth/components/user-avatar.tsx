'use client'

import { User } from '@/features/auth/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LogOut, Building, Mail, Shield } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { ROUTES } from '@/routes'
import { cn } from '@/lib/utils'

export interface UserAvatarProps {
    user?: User
}

export const UserAvatar = ({ user: userProp }: UserAvatarProps) => {
    const { data: session } = useSession()

    // Use provided user prop or fall back to session user
    const user = userProp || (session?.user as User | undefined)

    if (!user) {
        return null
    }
    const getInitials = (name: string | null, email: string): string => {
        if (name) {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        // Fallback to email initial
        return email[0].toUpperCase()
    }

    const initials = getInitials(user.name, user.email)

    const handleSignOut = async () => {
        await signOut({ callbackUrl: ROUTES.HOME })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                    <Avatar className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-80">
                        <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                {/* User info section */}
                <div className="p-4">
                    <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            {user.name && <h4 className="text-base font-semibold">{user.name}</h4>}
                            <div className="text-muted-foreground flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <p className="text-sm">{user.email}</p>
                            </div>
                            {user.company_name && (
                                <div className="text-muted-foreground flex items-center space-x-1">
                                    <Building className="h-4 w-4" />
                                    <p className="text-sm">{user.company_name}</p>
                                </div>
                            )}
                            <div className="flex items-center space-x-3">
                                <span
                                    className={cn(
                                        'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
                                        {
                                            'bg-success/10 text-success': user.is_active,
                                            'bg-muted text-muted-foreground': !user.is_active
                                        }
                                    )}
                                >
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <div className="text-muted-foreground flex items-center space-x-1">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm capitalize">{user.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
