'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoginFormData, loginSchema } from '@/features/auth/types'
import { ROUTES } from '@/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false
            })

            if (result?.error) {
                // eslint-disable-next-line no-console
                console.warn('Login form error:', result.error)
                setError('Invalid email or password')
            } else {
                router.push(ROUTES.PORTFOLIO_DASHBOARDS)
                router.refresh()
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Unexpected login form error:', error)
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                    Email
                </Label>
                <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    className="w-full"
                />
                {errors.email && (
                    <p className="text-destructive mt-1 text-xs sm:text-sm">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                    Password
                </Label>
                <div className="relative">
                    <Input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="w-full pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-destructive mt-1 text-xs sm:text-sm">
                        {errors.password.message}
                    </p>
                )}
            </div>

            {error && (
                <div className="border-destructive/20 bg-destructive/10 dark:border-destructive/30 dark:bg-destructive/20 rounded-lg border p-3">
                    <p className="text-destructive text-xs sm:text-sm">{error}</p>
                </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full" size="default">
                {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
        </form>
    )
}
