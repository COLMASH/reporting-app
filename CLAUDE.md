# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 reporting application for Malatesta Group, using:

- Next.js 15.3.3 with App Router and Turbopack
- React 19 with TypeScript
- TanStack Query for data fetching and state management
- NextAuth v5 (beta) for authentication
- Tailwind CSS v4 for styling
- Zustand for global state management

## Essential Commands

```bash
# Development
npm run dev          # Start development server with Turbopack

# Code Quality
npm run lint         # Run Next.js linting
npm run check-types  # TypeScript type checking
npm run check-lint   # ESLint checking
npm run check-format # Prettier format checking
npm run format       # Auto-format code with Prettier

# Building
npm run build        # Production build
npm run start        # Start production server

# Pre-commit Testing
npm run test-all     # Run all checks: format, lint, types, and build
```

## Architecture

### Directory Structure

- `/src/app/` - Next.js App Router pages and API routes
    - `layout.tsx` - Root layout with Providers wrapper
    - `providers.tsx` - Client-side providers (TanStack Query)
    - `/api/auth/[...nextauth]/` - NextAuth API routes
- `/src/auth.ts` - NextAuth configuration (currently minimal)
- `/src/lib/` - Shared utilities and business logic
    - `/hooks/` - Custom React hooks
    - `/stores/` - Zustand state stores
    - `/utils/` - Utility functions (includes `cn.ts` for classnames)
- `/src/ui/` - UI components and styles
- `/src/middleware.ts` - Next.js middleware

### Path Aliases

- `@/*` maps to `./src/*` for clean imports

### Pre-commit Hooks

Husky runs automatic checks before commits:

1. Prettier formatting check
2. ESLint standards check
3. TypeScript type checking
4. Production build verification

All checks must pass before committing. Use `npm run format` to auto-fix formatting issues.

### Key Dependencies

- **TanStack Query**: Configured with 60s stale time, window focus refetch disabled
- **NextAuth v5**: Authentication setup (providers to be configured)
- **Tailwind CSS v4**: PostCSS-based styling with prettier plugin
- **Lucide React**: Icon library
- **CVA & clsx**: Utility libraries for component variants and classnames
