# Reporting App - Malatesta Group

A modern reporting application built with Next.js 15, TypeScript, and NextAuth v5 for authentication.

## Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth v5 (Auth.js)
- **Styling**: Tailwind CSS v4
- **State Management**:
    - TanStack Query v5 (Server state)
    - Zustand v5 (Client state)
- **Form Handling**: React Hook Form + Zod
- **Backend Integration**: FastAPI (External)

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   └── auth/           # NextAuth API routes
│   ├── dashboard/          # Protected dashboard pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Login page (root route)
│   └── providers.tsx      # Client-side providers
│
├── features/              # Feature-based modules
│   └── auth/             # Authentication feature
│       ├── components/   # Auth UI components
│       ├── services/     # Auth API services
│       └── types/        # Auth TypeScript types
│
├── components/           # Shared components
│   ├── ui/              # Base UI components
│   ├── layouts/         # Layout components
│   └── common/          # Common components
│
├── lib/                 # Core libraries
│   ├── api/            # API client configuration
│   └── utils/          # Utility functions
│
├── hooks/              # Shared React hooks
├── stores/             # Zustand stores
├── routes/             # Route constants
├── styles/             # Global styles
├── types/              # Global TypeScript types
├── __tests__/          # Test files
│
├── auth.ts             # NextAuth configuration
└── middleware.ts       # Route protection middleware
```

## Features

### Authentication

- ✅ Email/Password login with NextAuth v5
- ✅ JWT-based sessions (30-minute expiry)
- ✅ Protected routes with middleware
- ✅ Integration with FastAPI backend
- ✅ Full user data in session (email, name, role, company, etc.)
- ✅ Automatic token verification

### Code Organization

- ✅ Feature-based architecture
- ✅ Functional programming approach (no OOP)
- ✅ Centralized route constants
- ✅ Type-safe API client
- ✅ Organized test structure

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Access to the FastAPI backend

### Environment Variables

Create a `.env.local` file:

```env
AUTH_SECRET=your-auth-secret-here
NEXT_PUBLIC_API_URL=https://reporting-app-back-dev.onrender.com
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the login page.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check-types  # TypeScript type checking
npm run test-all     # Run all checks before commit
```

## Authentication Flow

1. User enters credentials on login page (`/`)
2. NextAuth validates with FastAPI backend
3. JWT token stored in secure httpOnly cookie
4. User redirected to dashboard (`/dashboard`)
5. Middleware protects authenticated routes
6. Session includes full user data from backend

## API Integration

The app integrates with a FastAPI backend:

- **Base URL**: `https://reporting-app-back-dev.onrender.com`
- **Auth Endpoints**: `/api/v1/auth/*`
- **Token Type**: JWT Bearer tokens

## Deployment

This app is configured for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

## Development Guidelines

### Code Style

- Functional programming (avoid classes/OOP)
- Named exports over default exports
- TypeScript strict mode enabled
- No `any` types
- Route constants instead of hardcoded paths

### Feature Development

When adding new features:

1. Create feature folder in `src/features/`
2. Include components, services, types, and tests
3. Use shared components from `src/components/`
4. Add route constants to `src/routes/`

### Testing

- Unit tests colocated with code
- Integration tests in `__tests__/integration/`
- E2E tests in `__tests__/e2e/`

## License

Private - Malatesta Group
