# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 3005
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run lint:fix` - Run ESLint with automatic fixes
- `npm run format` - Format code with Prettier

### AI Assistant & MCP Server
- `npm run setup-mcp` - Set up MCP server configuration
- `npm run mcp-server` - Start MCP server for database connection

## Project Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Tailwind CSS v4 + Radix UI components + shadcn/ui
- **State Management**: Redux Toolkit with feature-based slices
- **Routing**: React Router v7 with role-based access control
- **Form Handling**: React Hook Form + Zod validation
- **Data Visualization**: Recharts
- **AI Integration**: Google Gemini AI with custom chat interface

### Core Architecture Patterns

#### Feature-Based Organization
Code is organized by business domains in `src/feature/`:
- `auth/` - Authentication & authorization with JWT tokens
- `student/` - Student management with CSV import/export
- `group/` - Group management and scheduling
- `payment/` - Payment processing and bulk operations
- `salary/` - Salary calculations and management
- `timetable/` - Schedule management with calendar views
- `fee/` - Fee management and tracking

#### Redux State Management
Each feature has its own Redux slice following RTK patterns:
- `slice/` - Redux Toolkit slices with async thunks
- `services/` - API service functions using axios
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks for feature logic

#### Authentication & RBAC
- JWT-based authentication with automatic token refresh
- Role-based access control with `RoleBasedAccess` component
- Supported roles: ADMIN, MANAGER, TEACHER
- Protected routes and component-level permissions

#### API Integration
- Centralized API client with axios interceptors
- Automatic token injection and refresh handling
- Environment-based configuration via `VITE_SERVER_ROOT_URL`
- RESTful API patterns with consistent error handling

### Key Configuration Files
- `vite.config.ts` - Vite configuration with path aliases (`@/` → `src/`)
- `components.json` - shadcn/ui configuration (New York style)
- `tsconfig.json` - TypeScript configuration with path mapping
- `tailwind.config.ts` - Tailwind CSS v4 configuration

### Component Architecture
- `components/ui/` - Reusable UI components (shadcn/ui based)
- `components/common/` - Shared business components
- `components/features/` - Feature-specific components
- `components/auth/` - Authentication-related components

### Code Writing Guidelines
- Never write logic functions or components with comments
- Use existing UI components from `@/components/ui`
- Follow Redux Toolkit patterns for state management
- Implement role-based access control for sensitive features
- Use React Hook Form + Zod for form validation
- Follow the established file naming and organization patterns