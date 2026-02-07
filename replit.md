# Osyan - AI Prompt Engineering Terminal

## Overview

Osyan is a cyberpunk-themed AI prompt engineering tool that converts raw ideas into structured, professional prompts. Users select an AI persona (Gemini, GPT-4, Grok, Claude, or Architect), input their idea, and receive a structured prompt generated via Google's Gemini API. The output is primarily in Persian (Farsi) with optional English translation and JSON format. The app features a Matrix-inspired hacker aesthetic with CRT effects, glitch animations, and a terminal-style UI.

The app has two main pages: a landing page with animated cyberpunk branding, and a terminal page where users interact with the prompt generation engine and view history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with two routes: `/` (Landing) and `/terminal` (Terminal)
- **State/Data Fetching**: TanStack React Query for server state management. Custom hooks in `client/src/hooks/use-prompts.ts` wrap API calls
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Animations**: Framer Motion for page transitions and UI effects
- **Styling**: Tailwind CSS with custom cyberpunk/hacker theme (neon green on dark background). CSS variables defined in `client/src/index.css`. Fonts: Fira Code (mono), Share Tech Mono (display)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (Express + Node.js)
- **Framework**: Express.js running on Node.js with TypeScript (executed via tsx)
- **API Structure**: RESTful API defined in `shared/routes.ts` with Zod validation schemas. Two main endpoints:
  - `POST /api/generate` — Generate a structured prompt from user input
  - `GET /api/history` — Retrieve past generated prompts
- **AI Integration**: Google Gemini API via `@google/genai` package, configured through Replit AI Integrations (uses `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables)
- **Persona System**: Five AI personas (Gemini, GPT-4, Grok, Claude, Architect) each with distinct system prompt characteristics and temperature settings
- **Dev Server**: Vite dev server integrated as middleware in development; static file serving in production

### Shared Code (`shared/`)
- `shared/schema.ts` — Drizzle ORM table definitions and Zod validation schemas (single source of truth)
- `shared/routes.ts` — API route definitions with request/response type contracts
- `shared/models/chat.ts` — Additional conversation/message schemas (for chat feature integration)

### Data Storage
- **Database**: PostgreSQL via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Push**: Use `npm run db:push` (drizzle-kit push) to sync schema to database
- **Tables**:
  - `prompts` — stores generated prompts (id, persona, input_idea, generated_prompt, english_prompt, json_prompt, created_at)
  - `conversations` and `messages` — chat feature tables (defined in `shared/models/chat.ts`)
- **Storage Layer**: `server/storage.ts` provides a `DatabaseStorage` class implementing `IStorage` interface

### Replit Integrations (`server/replit_integrations/`)
Pre-built modules for common AI features:
- **batch/** — Batch processing utilities with rate limiting and retry logic for Gemini API
- **chat/** — Full conversation CRUD routes and storage for chat functionality
- **image/** — Image generation endpoint using `gemini-2.5-flash-image` model

### Build System
- **Development**: `npm run dev` — runs tsx with Vite HMR middleware
- **Production Build**: `npm run build` — Vite builds the client to `dist/public`, esbuild bundles the server to `dist/index.cjs`
- **Type Checking**: `npm run check` — TypeScript compiler check

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (must be provisioned)
- `AI_INTEGRATIONS_GEMINI_API_KEY` — API key for Gemini (provided by Replit AI Integrations)
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Base URL for Gemini API proxy (provided by Replit AI Integrations)

### Key Third-Party Services
- **Google Gemini API** — Powers all AI prompt generation, chat, and image features. Accessed through Replit's AI Integrations proxy
- **PostgreSQL** — Primary data store via node-postgres (`pg` package)

### Major npm Dependencies
- `express` — HTTP server framework
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `@google/genai` — Google Generative AI SDK
- `@tanstack/react-query` — Client-side data fetching and caching
- `framer-motion` — Animation library for UI effects
- `wouter` — Lightweight React router
- `zod` — Runtime type validation (shared between client and server)
- `date-fns` — Date formatting for history timestamps
- shadcn/ui ecosystem: Radix UI primitives, Tailwind CSS, class-variance-authority