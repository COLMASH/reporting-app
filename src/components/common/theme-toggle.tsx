'use client'

import { Moon, Sun } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { toggleTheme } from '@/redux/features/themeSlice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const theme = useAppSelector(state => state.themeSlice.theme)
    const dispatch = useAppDispatch()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
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
