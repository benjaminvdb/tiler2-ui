# Tiler2 UI Architecture

## Directory Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── auth-buttons/       # Authentication UI components
│   ├── thread/             # Main chat thread components
│   │   ├── agent-inbox/    # Agent interaction components
│   │   ├── artifact/       # Code/artifact display components
│   │   ├── history/        # Thread history components
│   │   ├── messages/       # Message display components
│   │   └── ...
│   └── ui/                 # Reusable UI primitives
├── hooks/                  # Custom React hooks
├── providers/              # React context providers
└── utils/                  # Utility functions
```

## Naming Conventions

- **Files**: kebab-case (e.g., `user-dropdown.tsx`)
- **Components**: PascalCase (e.g., `UserDropdown`)
- **Variables/Functions**: camelCase (e.g., `handleSubmit`)

## Component Organization

### Barrel Exports

Components are organized with barrel exports (`index.ts`/`index.tsx`) to provide clean import paths:

```typescript
// Instead of:
import { UserDropdown } from "./components/auth-buttons/components/user-dropdown";

// Use:
import { UserDropdown } from "./components/auth-buttons/components";
```

### Component Structure

Each major component follows this pattern:

```
component-name/
├── index.tsx              # Main component
├── components/            # Sub-components
│   ├── index.ts          # Barrel exports
│   └── sub-component.tsx
├── hooks/                # Component-specific hooks
├── utils/                # Component-specific utilities
└── types.ts              # TypeScript types
```

## Key Principles

1. **Single Responsibility**: Each component has a clear, focused purpose
2. **Consistent Structure**: Similar components follow the same organizational pattern
3. **Minimal Nesting**: Avoid deeply nested directories (max 6-7 levels)
4. **Logical Grouping**: Related functionality is grouped together
5. **Clean Imports**: Use barrel exports to simplify import statements

## Recent Improvements

- Consolidated over-nested utility functions into single files
- Removed unused components (e.g., unused Card component)
- Flattened directory structure where appropriate
- Maintained consistent naming conventions throughout
