# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a temperature blanket application built with Bun, React, TypeScript, and Tailwind CSS. It fetches daily temperature data from the VisualCrossing API, stores it in a SQLite database, and maps temperatures to color ranges for creating temperature blankets (crochet/knitting projects where each day's temperature is represented by a colored row).

## Development Commands

### Running the Application
- **Development server**: `bun dev` - Starts the dev server with hot module reloading at http://localhost:3000
- **Production server**: `bun start` - Runs the production server (requires `NODE_ENV=production`)
- **Build**: `bun run build.ts` - Builds the application for production to the `dist` directory
  - Supports CLI options: `--outdir`, `--minify`, `--sourcemap`, `--target`, etc.
  - Run `bun run build.ts --help` for all options

### Code Quality
- **Formatting**: Uses Prettier with Tailwind CSS plugin (single quotes, no semicolons, trailing commas)

## Architecture

### Monorepo Structure
The codebase is organized as a monorepo with client and API code in the same project:

- **`src/api/`** - Bun server with route-based API endpoints
  - **`src/api/routes/`** - Route handlers organized by domain
  - **`src/api/services/`** - Business logic and external API integration
- **`src/client/`** - React frontend with shadcn/ui components
- **`src/db/`** - SQLite database initialization and operations
  - **`src/db/services/`** - Database service layer with type-safe operations
- **`src/models/`** - Shared TypeScript types
  - **`src/models/db/`** - Database table models and types
  - **`src/models/api/`** - API request/response models

### Server Architecture (`src/api/index.ts`)
The Bun server uses Bun's built-in `serve()` function with a routes-based pattern:
- Routes are defined in separate route modules in `src/api/routes/`
- Route factories (`createTemperatureRoutes`, `createTemperatureRangeRoutes`) receive service instances via dependency injection
- Route handlers can be objects with HTTP method keys (`GET`, `PUT`, etc.) or async functions
- The wildcard route `/*` serves the React app's HTML for client-side routing
- Development mode enables HMR and browser console echoing
- All route handlers use async/await for consistency

### Database Layer
**`src/db/db.ts`** - Database initialization and service exports
- Uses Bun's built-in SQLite (`bun:sqlite`)
- Two main tables:
  - `temperature_ranges` - Maps temperature ranges to colors (seeded on init)
  - `daily_temperatures` - Stores daily high temperatures with associated colors
- Exports service instances: `temperatureRangeService`, `dailyTemperatureService`

**`src/db/services/`** - Service layer with separated concerns
- **`TemperatureRangeService`** - Operations on temperature ranges
  - `getAll()` - Retrieve all temperature ranges
  - `getColorForTemperature(temp)` - Map a temperature to its color
  - `seed(ranges)` - Seed initial temperature ranges
- **`DailyTemperatureService`** - Operations on daily temperature records
  - `getAll()` - Retrieve all temperature records
  - `getByYear(year)` - Get records for a specific year
  - `getByDateRange(start, end)` - Get records in a date range
  - `getLastRecordedDate()` - Find the most recent date in the database
  - `insert(record)` - Insert a new temperature record
  - `getStats()` - Get database statistics (total records, latest date)

### API Routes (`src/api/routes/`)
**Temperature Routes** - `/api/temperatures/*`
- `GET /api/temperatures` - Get all temperature records
- `GET /api/temperatures/year/:year` - Get records for a specific year
- `GET /api/temperatures/stats` - Get database statistics

**Temperature Range Routes** - `/api/temperature-ranges/*`
- `GET /api/temperature-ranges` - Get all temperature ranges
- `GET /api/temperature-ranges/color/:temp` - Get color for a specific temperature

### API Services (`src/api/services/`)
**`WeatherService`** - Integration with VisualCrossing API
- `fetchTemperatureData(request)` - Fetches temperature data from VisualCrossing Timeline API
- Uses async/await for all operations
- Proper error handling with meaningful error messages

### Frontend Architecture (`src/client/`)
- React 19 with TypeScript
- Entry point: `frontend.tsx` sets up React root with HMR support
- Main component: `App.tsx`
- Uses shadcn/ui components (Button, Input, Label, Select, Textarea, Card)
- Path alias `@/*` maps to `src/*` (configured in `tsconfig.json` and `components.json`)
- Tailwind CSS v4 with `bun-plugin-tailwind` for styling

### Build System (`build.ts`)
- Custom Bun build script with CLI argument parsing
- Scans for all `.html` files in `src/` as entrypoints
- Integrates `bun-plugin-tailwind` for Tailwind CSS processing
- Supports production builds with minification and source maps
- Outputs formatted build results table

## Environment Variables

Required environment variables (see `.env.example`):
- `VISUALCROSSING_API_KEY` - API key for VisualCrossing weather API
- `LATITUDE` - Location latitude for weather data
- `LONGITUDE` - Location longitude for weather data
- `TIMEZONE` - Timezone for determining "yesterday" (e.g., `America/New_York`)

Public environment variables are prefixed with `BUN_PUBLIC_*` (configured in `bunfig.toml`).

## TypeScript Configuration

- Uses Bun's bundler module resolution
- Strict mode enabled with additional safety checks (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- Path alias: `@/*` → `./src/*`
- JSX transform: `react-jsx` (React 19 automatic runtime)
- Module: `Preserve` (for Bun's native module handling)

## Key Dependencies

- **Bun**: Runtime and bundler
- **React 19**: UI framework
- **Tailwind CSS v4**: Styling with `bun-plugin-tailwind`
- **shadcn/ui**: Component library (New York style, neutral theme)
- **SQLite**: Database (Bun's built-in `bun:sqlite`)
- **ESLint**: With unicorn and prettier plugins
- **TypeScript**: Type safety

## API Integration Pattern

The application fetches temperature data from VisualCrossing's Timeline API:
- URL format: `timeline/{lat},{lon}/{startDate}/{endDate}`
- Parameters: `unitGroup=us&include=days`
- Response type defined in `src/models/api/temperature-data-response.ts`
- Data is incrementally fetched - only missing dates between last recorded and yesterday
