# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context Management

**IMPORTANT**: Always read `CONTEXT.md` at the start of each new conversation to understand:
- Current project status and recent changes
- Completed features and active issues  
- Technical decisions made in previous sessions
- Environment configuration and setup

**Context Limit Management**: When approaching 90% context limit:
1. Update `CONTEXT.md` with completed work and decisions made
2. Summarize key technical findings and next steps
3. Update the "Recent Significant Changes" section
4. Note any new issues discovered or environment changes

## Project Overview

This is a React + TypeScript + Vite frontend application for a school management system called "Chemist FE". It's a comprehensive education management platform that handles students, fees, groups, schedules, and includes an AI assistant feature.

## Key Technologies & Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: TailwindCSS v4 
- **State Management**: Redux Toolkit with feature-based slices
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form with Zod validation
- **AI Integration**: Google Gemini AI with custom tool engine
- **Database Integration**: PostgreSQL via MCP server for AI assistant

## Development Commands

```bash
# Development server (runs on port 3005)
npm run dev

# Build for production
npm run build

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format

# Preview production build
npm run preview

# AI Assistant MCP server
npm run mcp-server

# Setup MCP server
npm run setup-mcp
```

## Project Structure

### Core Directories

- `src/pages/` - Route components (Dashboard, Student Management, Finance, Groups, etc.)
- `src/feature/` - Feature modules with their own components, services, hooks, and Redux slices
- `src/components/` - Reusable UI components split into `common/`, `features/`, and `ui/`
- `src/service/` - API service layer for backend communication
- `src/redux/` - Redux store configuration and feature slices
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

### Feature Structure

Each feature follows a consistent structure:
```
src/feature/{feature-name}/
├── components/     # Feature-specific components
├── services/       # API services for this feature
├── hooks/         # Custom hooks for this feature
├── slice/         # Redux slice for state management
├── types/         # TypeScript types
└── schemas/       # Zod validation schemas
```

## API Services Architecture

All API services are located in `src/service/` and follow CRUD patterns:
- Each service provides methods like `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- Services use the centralized `api-client.ts` which handles authentication automatically
- Token management and refresh is handled transparently
- All services throw errors on API failures - always use try-catch blocks

## State Management

- Uses Redux Toolkit with feature-based slices
- Each major feature has its own slice in `src/redux/slice/` or within the feature directory
- Store configuration is in `src/redux/store.ts`
- Use typed hooks from `src/redux/hook.ts`

## UI Components

- Uses shadcn/ui components in `src/components/ui/`
- Common reusable components in `src/components/common/`
- Feature-specific components in `src/components/features/`
- All components use TypeScript and follow consistent naming conventions

## AI Assistant Feature

- Integrated Google Gemini AI with custom tool engine
- Located in `src/feature/ai-assistant/`
- Connects to PostgreSQL database via MCP (Model Context Protocol) server
- Tools engine provides database access and API integration capabilities
- Custom UI components for chat interface in `src/components/ui/kibo-ui/`

## Authentication

- JWT-based authentication with automatic token refresh
- Auth logic in `src/feature/auth/`
- Token management handles expired tokens transparently
- All API calls automatically include authentication headers

## Environment Setup

Required environment variables:
- `VITE_GEMINI_API_KEY` - For AI assistant functionality

## File Upload & Media

- File upload components in `src/components/file-view-and-picker/`
- Handles local storage, media files, and public API integration
- Used for student data import (CSV files) and document management

## Timetable/Schedule System

- Complex scheduling system in `src/components/features/schedule/`
- Supports daily and weekly views
- Event management with modals and filters
- Integration with group and room management

## Development Notes

- Uses absolute imports with `@/` alias pointing to `src/`
- All API services include comprehensive Vietnamese documentation
- Error boundaries implemented for robust error handling
- Responsive design with mobile-first approach using TailwindCSS
- Form validation uses Zod schemas consistently across features

## Database Integration

The AI assistant connects to a PostgreSQL database via MCP server:
- Database: `chemist` on `localhost:5432`
- Credentials: `postgres:root`
- MCP server runs on port 3000
- Provides read access to database, write access only when explicitly requested

## Context Management System

This project uses a context management system to maintain continuity across Claude Code sessions:

### CONTEXT.md File
- **Purpose**: Tracks conversation history, completed tasks, and project state
- **Location**: `/CONTEXT.md` in project root
- **Usage**: MUST be read at the start of every new conversation

### Context Management Workflow
1. **Session Start**: Always read `CONTEXT.md` first to understand previous context
2. **During Session**: Update `CONTEXT.md` with important changes and decisions
3. **Token Limit Approaching**: When approaching 90% token limit, update `CONTEXT.md` with current session summary
4. **Session End**: Update completed tasks and next steps in `CONTEXT.md`

### What to Track
- Completed tasks and code changes
- Important architectural decisions
- Current project status and active features
- File modifications and their purposes  
- Next steps and pending items
- Key insights and context for future sessions

This system ensures no context is lost between conversations and maintains development continuity.

## Timezone Handling System

**IMPORTANT**: The application now implements comprehensive timezone handling for Vietnam timezone (GMT+7).

### Core Timezone Architecture

- **Server Storage**: All dates/times stored in UTC on server
- **Client Display**: All dates/times displayed in Vietnam local time (GMT+7)
- **Form Inputs**: Users input times in Vietnam timezone, automatically converted to UTC for server
- **Consistent Conversion**: Centralized timezone utilities ensure consistent handling across the application

### Timezone Utilities

#### Location: `src/utils/timezone-utils.ts`
Core functions for timezone conversion:
- `utcToVietnamTime()` - Convert UTC dates from server to Vietnam local time
- `vietnamTimeToUtc()` - Convert Vietnam local time to UTC for server
- `convertUtcTimeToVietnamString()` - Convert UTC time strings to Vietnam time strings
- `convertVietnamTimeToUtcString()` - Convert Vietnam time strings to UTC for API calls
- `getCurrentVietnamTime()` - Get current time in Vietnam timezone
- `parseVietnamTime()` - Parse time strings in Vietnam timezone context

#### Location: `src/utils/date-formatters.ts`
Display formatting utilities:
- `displayTime()` - Format times for display in Vietnam timezone
- `displayDate()` - Format dates for display in Vietnam timezone  
- `displayDateTime()` - Format date/time combinations
- `displayTimeRange()` - Format time ranges (e.g., "08:00 - 10:00")
- `displayDayEnum()` - Convert day enums to Vietnamese day names
- Vietnamese localization for all time/date displays

### Implementation Areas

#### Group Schedule Management
- **Form Inputs**: `form-add-group-schedule.tsx` - Time inputs show "(GMT+7)" and convert properly
- **Edit Dialogs**: `group-dialog-edit.tsx` - Displays Vietnam times, converts to UTC on save
- **Create Forms**: `form-create-group.tsx` - Handles timezone conversion for new groups
- **Schema Validation**: Updated to handle timezone-aware time formats

#### Timetable/Calendar System
- **Calendar Utils**: `calendar-utils.ts` - All calendar events display in Vietnam timezone
- **Event Conversion**: `convertScheduleToEvent()` - Converts UTC schedules to local display times
- **Today Detection**: Uses Vietnam timezone for current date/time comparisons
- **Active Events**: Event status based on Vietnam local time

#### Type Definitions
- **Enhanced Types**: Added `UTCTimeString`, `UTCDateString`, `LocalTimeString` types
- **Documentation**: All time-related interfaces include timezone handling documentation
- **GroupSchedule**: Enhanced with timezone-aware field documentation

### Usage Guidelines

#### For New Components
```typescript
// Display server time to user
const displayTime = convertUtcTimeToVietnamString(serverTime);

// Send form time to server  
const serverTime = convertVietnamTimeToUtcString(formTime);

// Display formatted time
const formattedTime = displayTime(utcTimeFromServer); // Shows Vietnam time
```

#### For Form Components
- Always show timezone indicators like "(GMT+7)" for clarity
- Convert form inputs from Vietnam time to UTC before API calls
- Convert API responses from UTC to Vietnam time for display
- Use meaningful defaults (8 AM - 10 AM Vietnam time)

### Dependencies
- **date-fns-tz v3.2.0**: Core timezone conversion library
- **API Compatibility**: Uses `fromZonedTime()` and `toZonedTime()` functions
- **Vietnam Timezone**: `Asia/Ho_Chi_Minh` (GMT+7, no daylight saving time)

## Recent Major Enhancements

### Group Dialog UI Improvements (Latest Session)

#### Layout & Responsiveness
- **Mobile-First Design**: Responsive grid layouts with proper breakpoints
- **Consistent Sizing**: Both create and edit dialogs use `sm:max-w-[900px]` 
- **Form Layout**: Changed from fixed `grid-cols-3` to responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Schedule Form**: Updated to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for mobile compatibility

#### Dialog State Management
- **Proper State Control**: Added missing `open`/`onOpenChange` props to edit dialog
- **Form Reset**: Dialogs properly reset and close after successful operations
- **Loading States**: Maintained all existing loading indicators and error handling

#### Room Integration
- **Complete Room Selection**: Added room selection to group schedule forms
- **Database Integration**: Uses existing `useRoom` hook and room service
- **Display Format**: Shows rooms as "{name} - {location}" format
- **Type Safety**: Enhanced `GroupSchedule` interface with `room_id` and `room` fields

#### Action Column Consistency
- **Dropdown Integration**: Edit button now properly integrates with dropdown menu
- **Variant Support**: `GroupDialogEdit` component supports both button and dropdown variants
- **Consistent Styling**: Matches "Xem chi tiết" pattern with icon + text layout

#### Form Validation & Schemas
- **Unified Validation**: Both create and edit forms use consistent Zod schemas
- **Room Validation**: Added room selection validation to form schemas
- **Time Format**: Fixed time format validation issues between create/edit forms
- **Error Handling**: Comprehensive form validation with proper error messages

### Files Modified in Latest Session
- `src/feature/group/components/group-dialog-edit.tsx` - Layout, state, timezone conversion
- `src/feature/group/components/group-table.tsx` - Action column consistency
- `src/feature/group/components/form-add-group-schedule.tsx` - Responsive layout, timezone handling
- `src/feature/group/components/form-create-group.tsx` - Schema alignment, timezone conversion
- `src/feature/group/components/dialog-add-group.tsx` - Dialog sizing, state management
- `src/feature/timetable/utils/calendar-utils.ts` - Timezone conversion for calendar events
- `src/types/api.types.ts` - Enhanced with timezone-aware types and room integration
- `src/utils/timezone-utils.ts` - Comprehensive timezone conversion utilities
- `src/utils/date-formatters.ts` - Vietnamese localized date/time formatting

This system ensures consistent timezone handling across the entire application while maintaining excellent user experience with proper Vietnamese localization.