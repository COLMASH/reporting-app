# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reporting application for Malatesta Group using Next.js 15, TypeScript, and NextAuth v5.

## Critical Guidelines

### Code Style

- **Use functional programming** - NO classes or OOP patterns
- **Named exports only** - Avoid default exports
- **No `any` types** - Use `unknown` or proper types
- **Use route constants** - Never hardcode paths like '/dashboard'

### Development Workflow

- **Run `npm run format` then `npm run build` after major changes** to ensure formatting and compilation
- **Use path aliases** - `@/*` for imports
- **Test with `npm run test-all`** before committing

### Architecture Principles

- **Feature-based folder structure** - See README for details
- **Functional services** - Export functions, not classes
- **Centralized constants** - Routes in `src/routes/`
- **Type safety first** - Define all interfaces

### Authentication

- NextAuth v5 with JWT sessions (30 min)
- FastAPI backend: `https://reporting-app-back-dev.onrender.com`
- Protected routes via middleware

### State Management

- **Server state**: TanStack Query
- **Client state**: Zustand (when needed)
- **Forms**: React Hook Form + Zod

### Essential Commands

```bash
npm run dev       # Development
npm run format    # Format code with Prettier
npm run build     # Check compilation
npm run test-all  # Run all checks
```

Remember: Always prefer functional patterns and run `format` before `build`.
