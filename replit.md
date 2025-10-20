# Overview

EnglishPro Test is a comprehensive online English proficiency certification platform that offers a full-stack testing experience. The application provides a multi-section English test (Reading, Listening, Writing, Speaking) with payment processing, real-time test-taking interface, and certificate generation. Users can register, take timed tests, make payments through Paystack, and receive official certificates upon completion.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a modern component-based architecture:
- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing with pages for landing, registration, test-taking, and results
- **State Management**: React Query (@tanstack/react-query) for server state management and data fetching
- **Form Management**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
The backend uses Express.js with TypeScript in a RESTful API structure:
- **Framework**: Express.js with TypeScript for type safety
- **Storage Pattern**: Abstract storage interface (IStorage) with in-memory implementation (MemStorage)
- **API Structure**: RESTful endpoints for user management, test sessions, test answers, and payments
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development Setup**: Vite middleware integration for seamless full-stack development

## Database Design
The application uses Drizzle ORM with PostgreSQL:
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with schema migrations
- **Schema Structure**:
  - Users table for user registration and profile data
  - Test sessions for tracking test attempts and scores
  - Test answers for storing individual question responses
  - Payments table for payment tracking and verification
- **Validation**: Drizzle-Zod integration for runtime schema validation

## Authentication & Authorization
Currently uses a simple user identification system:
- User registration with email uniqueness validation
- Session-based user identification through test session IDs
- No complex authentication middleware (potential area for future enhancement)

## External Integrations
- **Payment Processing**: Paystack integration for secure payment handling
- **Database Hosting**: Neon Database serverless PostgreSQL
- **Development Tools**: Replit-specific plugins for development environment

## Key Design Patterns
- **Repository Pattern**: Abstract storage interface allows for easy database implementation swapping
- **Component Composition**: Modular UI components with clear separation of concerns
- **Form Validation**: Consistent validation using Zod schemas shared between frontend and backend
- **Error Boundary**: Comprehensive error handling with user-friendly messages
- **Real-time Features**: Timer functionality and progress tracking during test sessions

## Test Structure
The application supports a comprehensive English proficiency test with:
- Reading comprehension with multiple choice and essay questions
- Listening section (structure defined but implementation pending)
- Writing section with essay prompts
- Speaking section (structure defined but implementation pending)
- Automatic scoring and certificate generation upon completion

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm & drizzle-kit**: Type-safe database ORM and migration tools
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **express**: Node.js web framework for API endpoints
- **react & react-dom**: Core React libraries for UI rendering
- **vite**: Fast build tool and development server

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Modern icon library

## Form and Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

## Development and Build Tools
- **typescript**: Static type checking for JavaScript
- **@vitejs/plugin-react**: Vite plugin for React support
- **esbuild**: Fast JavaScript bundler for server-side code
- **tsx**: TypeScript execution for Node.js development

## External Services
- **Paystack**: Payment processing service for test fees
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment with specialized plugins

## Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **clsx & tailwind-merge**: Conditional className utilities
- **nanoid**: URL-safe unique string ID generator
- **cmdk**: Command palette component for search interfaces