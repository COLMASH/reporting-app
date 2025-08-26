export const ROUTES = Object.freeze({
    HOME: '/',
    DASHBOARD: '/dashboard',
    PORTFOLIO_DASHBOARDS: '/dashboards',
    API: Object.freeze({
        AUTH: '/api/auth'
    })
} as const)

export const PROTECTED_ROUTES = Object.freeze([ROUTES.DASHBOARD] as const)

export const PUBLIC_ROUTES = Object.freeze([ROUTES.HOME] as const)
