# CONTEXT.md

This file maintains conversation context and project state across Claude Code sessions to ensure continuity when token limits are reached.

## Current Session Summary

**Date**: 2025-07-23  
**Session Focus**: Initial codebase analysis and context management system setup  
**Status**: Active

### Completed This Session
- ✅ Analyzed entire codebase structure and architecture
- ✅ Created comprehensive CLAUDE.md file with project documentation
- ✅ Set up context management system with this CONTEXT.md file

### Key Findings
- React + TypeScript + Vite school management system ("Chemist FE")
- Well-organized feature-based architecture with Redux Toolkit
- Integrated AI assistant using Google Gemini with PostgreSQL MCP server
- Comprehensive API service layer with automatic authentication
- Modern UI stack using shadcn/ui and TailwindCSS v4

## Project State

### Current Branch
- **Branch**: development
- **Main Branch**: main
- **Recent Changes**: Added CLAUDE.md and CONTEXT.md files

### Active Features
- Student management system
- Fee and payment tracking  
- Group and class management
- Timetable/scheduling system
- AI assistant with database integration
- Authentication system

### Environment Status
- **Dev Server**: Port 3005 (npm run dev)
- **Database**: PostgreSQL on localhost:5432 (chemist db)
- **MCP Server**: Port 3000
- **Required Env**: VITE_GEMINI_API_KEY

## Important Decisions Made

### Architecture Decisions
1. **Context Management**: Implemented CONTEXT.md system for session continuity
2. **Documentation**: Created comprehensive CLAUDE.md for future Claude instances
3. **Project Structure**: Confirmed feature-based organization is optimal

### Development Workflow
1. Always read CONTEXT.md at start of new sessions
2. Update CONTEXT.md when approaching 90% token limit
3. Use TodoWrite tool for task tracking within sessions

## Next Steps / Pending Items

### Immediate Tasks
- [ ] Update CLAUDE.md with context management instructions
- [ ] Initialize context tracking for future sessions

### Future Development Areas
- AI assistant MCP server configuration optimization
- Enhanced timetable features
- Additional API integrations

## File Changes Log

### 2025-07-23
- **Created**: `/CLAUDE.md` - Comprehensive project documentation
- **Created**: `/CONTEXT.md` - Context management system
- **Analysis**: Complete codebase structure review

## Session Notes

### Key Insights
- Codebase is well-structured with clear separation of concerns
- Strong TypeScript usage throughout
- Good API service abstraction layer
- Comprehensive UI component library

### Context Management Instructions for Future Sessions
1. **Start of Session**: Always read this CONTEXT.md file first
2. **During Session**: Track important changes and decisions here
3. **Near Token Limit**: Update this file with session summary before hitting limit
4. **End of Session**: Update completed tasks and next steps

---
*Last Updated: 2025-07-23 by Claude Code*