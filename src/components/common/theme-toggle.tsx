'use client'

import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Toggle theme"
        >
            <Sun
                className={cn(
                    'h-4 w-4 transition-all sm:h-5 sm:w-5',
                    theme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
                )}
            />
            <Moon
                className={cn(
                    'absolute h-4 w-4 transition-all sm:h-5 sm:w-5',
                    theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
                )}
            />
        </Button>
    )
}
