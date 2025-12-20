# Frontend Structure Guide

## Goals

- Make it obvious where code lives and where to add new code.
- Keep route files thin; move domain logic into features.
- Keep cross-cutting concerns in core and reusable UI in shared.

## Top-Level Conventions

- `src/app/`: Route entry points and app shell (layout/providers/globals). Route files should be thin and render feature pages.
- `src/features/<feature>/`: Feature slice. Owns UI, hooks, services, types, and utils for a domain area.
- `src/core/`: Cross-cutting infrastructure (routing, services, providers, config). No feature-specific logic.
- `src/shared/`: Reusable UI building blocks, hooks, utils, constants, and types.

## Feature Layout (Recommended)

Each feature should follow the same internal structure:

- `components/`: Feature-specific UI components.
- `pages/`: Full-page components used by routes (export default pages).
- `hooks/`: Feature-specific hooks/state.
- `services/`: API clients and data access.
- `types/`: Public types and interfaces.
- `utils/`: Pure helper functions.
- `constants/`: Feature constants and static config.
- `index.ts`: Curated public exports for other features.

## File Organization Rules

- Route files in `src/app/*` should only compose feature pages.
- Put business logic and helpers in feature `hooks/` or `utils/`, not in route files.
- Keep components focused; move large, reusable UI blocks to `components/`.
- Avoid deep nesting under `shared/components/ui` beyond one level.

## Function Order (Readability)

Inside a file, prefer this order:

1. Imports
2. Types/Interfaces
3. Constants
4. Helper functions
5. Hooks
6. Components
7. Exports

## Comments

- Add comments only for non-obvious logic or complex flows.
- Avoid restating what the code already says.
