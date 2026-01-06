# Osyan - AI Prompt Engineering System

## Overview

Osyan is a specialized AI prompt engineering application that transforms raw ideas into structured, professional prompts. The system features a cyberpunk/hacker aesthetic with a terminal-style interface, supporting multiple AI persona modes (Gemini, GPT-4, Grok, Claude, Architect) for generating tailored prompts in Persian (Farsi) with English and JSON output options.

The application converts user input ideas into formatted prompts with five sections: Role, Context, Task, Constraints, and Output Format. It includes an "Expert Mode" for generating highly specialized prompts with advanced terminology.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for complex animations (glitch effects, typewriter, entry animations)
- **Build Tool**: Vite with React plugin

The frontend uses a custom cyberpunk theme with CRT effects, matrix background animations, and neon green color scheme. Components follow the shadcn/ui pattern with Radix UI primitives.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for development
- **API Pattern**: REST endpoints with Zod schema validation
- **Build**: esbuild for production bundling with selective dependency bundling

Key routes:
- `POST /api/generate` - Generate prompts using AI
- `GET /api/history` - Retrieve prompt history

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

Main schema:
- `prompts` table: stores persona, input idea, generated prompt (Persian), English translation, and JSON format

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Models**: gemini-2.5-flash (text), gemini-2.5-flash-image (image generation)
- **Configuration**: Uses environment variables `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL`

The system includes multiple persona prompts that modify the AI's behavior and output style. Each persona (Gemini, GPT-4, Grok, Claude, Architect) has distinct characteristics defined in the base system prompt.

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/  # UI components (shadcn + custom)
│       ├── hooks/       # React hooks
│       ├── lib/         # Utilities
│       └── pages/       # Route pages
├── server/           # Express backend
│   ├── replit_integrations/  # AI integration modules
│   └── routes.ts     # API endpoints
├── shared/           # Shared types and schemas
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express

### AI Services
- **Google Gemini API**: Text and image generation via Replit AI Integrations
- Environment variables required:
  - `AI_INTEGRATIONS_GEMINI_API_KEY`
  - `AI_INTEGRATIONS_GEMINI_BASE_URL`

### Key NPM Packages
- **UI**: Radix UI primitives, Tailwind CSS, class-variance-authority, framer-motion
- **Data**: Drizzle ORM, Zod for validation, TanStack React Query
- **Server**: Express, pg (PostgreSQL client)
- **Utilities**: date-fns for timestamp formatting, nanoid for ID generation