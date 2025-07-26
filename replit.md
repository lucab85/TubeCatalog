# YouTube Video SEO Optimizer

## Overview

This is a full-stack web application that helps users optimize YouTube video metadata for better SEO performance. The application extracts video information from YouTube URLs, generates optimized titles, descriptions, and keywords using AI, and presents the results in a clean, user-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Development Setup
- **Monorepo Structure**: Shared code between client and server in `/shared` directory
- **Hot Reload**: Vite dev server with HMR for frontend, tsx for backend development
- **Type Safety**: Shared TypeScript interfaces and Zod schemas

## Key Components

### Database Schema (`/shared/schema.ts`)
- **Videos Table**: Stores YouTube video metadata including original and optimized content
- **Validation**: Zod schemas for type-safe API requests and database operations

### API Services
- **YouTube Service** (`/server/services/youtube.ts`): 
  - Extracts video IDs from various YouTube URL formats
  - Fetches video metadata using Google YouTube Data API v3
  - Attempts to extract video transcripts for content analysis
- **OpenAI Service** (`/server/services/openai.ts`):
  - Uses GPT-4o model for content optimization
  - Generates SEO-friendly titles, descriptions, and keywords
  - Structured JSON response format for consistent data handling

### Storage Layer (`/server/storage.ts`)
- **Interface-based Design**: IStorage interface for potential database swapping
- **Current Implementation**: In-memory storage (MemStorage) for development
- **Production Ready**: Configured for PostgreSQL with Drizzle ORM

### Frontend Components
- **Home Page** (`/client/src/pages/home.tsx`): Main interface for URL input and result display
- **UI Components**: Comprehensive Shadcn/ui component library
- **State Management**: React Query for API state with error handling and loading states

## Data Flow

1. **User Input**: User enters YouTube URL in the frontend form
2. **Validation**: URL is validated using Zod schema on both client and server
3. **Video Processing**: 
   - Extract video ID from URL
   - Check if video already exists in database
   - Fetch video metadata from YouTube API
   - Extract transcript if available
4. **AI Optimization**: Send video data to OpenAI for SEO optimization
5. **Data Storage**: Store original and optimized content in database
6. **Response**: Return optimized content to frontend for display

## External Dependencies

### APIs and Services
- **YouTube Data API v3**: Video metadata retrieval
- **OpenAI API**: Content optimization using GPT-4o
- **Neon Database**: Serverless PostgreSQL hosting

### Key Libraries
- **Frontend**: React, Vite, TanStack Query, Wouter, Tailwind CSS, Radix UI
- **Backend**: Express, Drizzle ORM, Zod validation
- **Shared**: TypeScript, date-fns, class-variance-authority

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `/dist/public`
- **Backend**: esbuild bundles server code to `/dist/index.js`
- **Database**: Drizzle migrations in `/migrations` directory

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **APIs**: `YOUTUBE_API_KEY` and `OPENAI_API_KEY` for external services
- **Production**: `NODE_ENV=production` for optimized builds

### Deployment Architecture
- **Static Assets**: Frontend served from `/dist/public`
- **API Server**: Express server handling `/api/*` routes
- **Database**: Serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Development vs Production
- **Development**: Vite dev server with HMR, in-memory storage
- **Production**: Built static files, PostgreSQL database, optimized bundles
- **Environment Detection**: Replit-specific plugins and configurations when `REPL_ID` is present