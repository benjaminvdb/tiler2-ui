# Styling & Theming

This document covers the styling system, including Tailwind CSS 4 configuration, design tokens, dark mode implementation, component styling patterns, and best practices.

## Tailwind CSS 4 Configuration

The application uses **Tailwind CSS 4**, the latest version with improved performance and new features.

**Configuration File**: `/home/user/tiler2-ui/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],  // Class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./agent/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "comic-mono": ['"Comic Mono"', "ui-monospace", "monospace"],
        inter: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-source-serif-pro)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Sustainability palette
        "forest-green": "var(--forest-green)",
        "charcoal-teal": "var(--charcoal-teal)",
        stone: "var(--stone)",
        sand: "var(--sand)",
        clay: "var(--clay)",
        sage: "var(--sage)",
        copper: "var(--copper)",
        amber: "var(--amber)",
        "ocean-blue": "var(--ocean-blue)",
        "almost-black": "var(--almost-black)",
        "off-white": "var(--off-white)",

        // Semantic colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        // ... more semantic colors
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar"),
  ],
};
```

**Key Features**:
- **CSS Variables**: All colors are CSS variables for runtime theming
- **Semantic Naming**: Colors named by purpose, not appearance
- **Custom Fonts**: Inter (sans), Source Serif 4 (serif), Comic Mono (mono)
- **Plugins**: Animation utilities and custom scrollbar styling

## Design System

### Color Palette

The application uses a **sustainability-themed color palette** with semantic naming.

**Location**: `/home/user/tiler2-ui/src/app/globals.css`

```css
:root {
  /* Sustainability Intelligence Color System */
  --forest-green: #0b3d2e;
  --charcoal-teal: #1b3a37;
  --stone: #f5f3ef;
  --sand: #eae7e0;
  --clay: #d6cec1;
  --sage: #93b1a6;
  --copper: #b26a3d;
  --amber: #e7b47a;
  --ocean-blue: #276f86;
  --almost-black: #111c17;
  --off-white: #f9f8f6;

  /* Workflow Category Colors */
  --governance-blue: #5a7fa8;
  --impact-terra: #9b5b5b;
  --innovation-mint: #8ba89b;
  --standards-gold: #c9a865;
  --engagement-charcoal: #3d4447;
  --strategy-mauve: #b39fc4;
}
```

### Semantic Color Tokens

Semantic tokens map to the palette colors and change based on theme:

```css
:root {
  --background: var(--stone);
  --foreground: var(--almost-black);
  --card: var(--off-white);
  --card-foreground: var(--almost-black);
  --primary: var(--forest-green);
  --primary-foreground: var(--off-white);
  --secondary: var(--sand);
  --secondary-foreground: var(--almost-black);
  --muted: var(--clay);
  --muted-foreground: #5a5850;
  --accent: var(--sage);
  --accent-foreground: var(--almost-black);
  --destructive: #c44536;
  --destructive-foreground: var(--off-white);
  --border: rgba(17, 28, 23, 0.1);
  --input: transparent;
  --ring: var(--sage);
}
```

**WHY Semantic Tokens**: Components use semantic names like `bg-primary` instead of `bg-forest-green`, making it easy to change themes without touching component code.

### Spacing Scale

Tailwind's default spacing scale is used with CSS variables:

```css
:root {
  --radius: 0.5rem;  /* 8px */
}

/* Usage in Tailwind config */
borderRadius: {
  lg: "var(--radius)",      /* 8px */
  md: "calc(var(--radius) - 2px)",  /* 6px */
  sm: "calc(var(--radius) - 4px)",  /* 4px */
}
```

### Typography

**Font Families**:

```css
:root {
  --font-inter: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-source-serif-pro: "Source Serif 4", Georgia, serif;
}

/* Applied to elements */
body {
  font-family: var(--font-inter), sans-serif;
}

h1, h2, h3 {
  font-family: var(--font-source-serif-pro), Georgia, serif;
}
```

**Font Weights**:

```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}
```

**Base Typography** (from `/home/user/tiler2-ui/src/app/globals.css`):

```css
@layer base {
  h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  p {
    font-size: var(--text-base);
    font-weight: var(--font-weight-normal);
    line-height: 1.7;
  }
}
```

**Font Loading** (via Google Fonts):

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap");
```

**Comic Mono** (for code/citations):

```javascript
// package.json
"@fontsource/comic-mono": "^5.2.5"
```

## CSS Variables for Theming

All theme values are defined as CSS variables, enabling runtime theme switching:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

**WHY `@theme inline`**: Tailwind 4's new `@theme` directive registers CSS variables as theme values, making them available in utility classes.

## Dark Mode Implementation

### Class-Based Dark Mode

The application uses **class-based dark mode** (not media query based):

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],  // Activate dark mode with .dark class
  // ...
};
```

**WHY Class-Based**: Gives users explicit control over theme preference, persisting their choice regardless of system settings.

### Dark Mode Tokens

Dark mode overrides semantic tokens:

```css
.dark {
  --background: var(--charcoal-teal);
  --foreground: var(--off-white);
  --card: #0f2c29;
  --card-foreground: var(--off-white);
  --primary: var(--sage);
  --primary-foreground: var(--almost-black);
  --secondary: #2a4f49;
  --secondary-foreground: var(--off-white);
  --muted: #2a4f49;
  --muted-foreground: #b8c4bf;
  --accent: var(--ocean-blue);
  --accent-foreground: var(--off-white);
  --destructive: #d97566;
  --destructive-foreground: var(--off-white);
  --border: rgba(147, 177, 166, 0.15);
  --input: rgba(147, 177, 166, 0.1);
  --ring: var(--sage);
}
```

### Custom Dark Mode Variant

Tailwind 4 uses a custom dark mode variant:

```css
@custom-variant dark (&:is(.dark *));
```

This allows you to use the `dark:` prefix in utility classes:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content adapts to theme
</div>
```

### Theme Toggling

```typescript
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button onClick={toggleTheme}>
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}
```

## Component Styling Patterns

### Utility-First Approach

The application follows Tailwind's **utility-first** methodology:

```tsx
// ✅ Good: Utility classes
<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
  Click me
</button>

// ❌ Avoid: Custom CSS classes
<button className="custom-button">
  Click me
</button>
```

**WHY**: Utility classes provide consistency, reduce CSS bundle size, and eliminate naming conflicts.

### Variant Pattern with CVA

Components use **class-variance-authority (CVA)** for variant management:

```typescript
// /home/user/tiler2-ui/src/shared/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        brand: "bg-forest-green text-white hover:bg-forest-green/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

**Usage**:

```tsx
<Button variant="destructive" size="sm">
  Delete
</Button>

<Button variant="outline" size="lg">
  Cancel
</Button>
```

**WHY CVA**: Provides type-safe variants, automatic class merging, and compound variants for complex styling logic.

### Conditional Styling with cn()

The `cn()` utility (from `clsx` + `tailwind-merge`) handles conditional classes:

```typescript
import { cn } from "@/shared/utils/utils";

function Component({ isActive, className }: Props) {
  return (
    <div
      className={cn(
        "base-styles",
        isActive && "active-styles",
        className,
      )}
    >
      Content
    </div>
  );
}
```

**WHY**: `tailwind-merge` prevents conflicts by intelligently merging Tailwind classes (e.g., `"p-4 p-8"` becomes `"p-8"`).

### Composition Pattern

Build complex components by composing smaller ones:

```tsx
// Base component
const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
);

// Composed variants
const CardHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

// Usage
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

## Custom Utilities

### Scrollbar Styling

Custom scrollbar utilities for sidebar:

```css
/* /home/user/tiler2-ui/src/app/globals.css */
@layer utilities {
  .scrollbar-sidebar {
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--clay);
      border-radius: 0px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: var(--sage);
    }
  }

  /* Dark mode scrollbar */
  .dark .scrollbar-sidebar {
    &::-webkit-scrollbar-thumb {
      background-color: rgba(147, 177, 166, 0.3);
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(147, 177, 166, 0.5);
    }
  }
}
```

### Shadow Utilities

```css
@layer utilities {
  .shadow-inner-right {
    box-shadow: inset -9px 0 6px -1px rgb(0 0 0 / 0.02);
  }

  .shadow-inner-left {
    box-shadow: inset 9px 0 6px -1px rgb(0 0 0 / 0.02);
  }
}
```

### Font Utilities

```css
@layer utilities {
  .citation-comic-mono {
    font-family: "Comic Mono", ui-monospace, monospace !important;
  }
}
```

## Responsive Design

### Breakpoints

Tailwind's default breakpoints are used:

```javascript
// Default breakpoints
{
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

### Mobile-First Approach

Design mobile-first, then add larger breakpoints:

```tsx
<div className="
  flex flex-col     /* Mobile: stack vertically */
  md:flex-row       /* Tablet+: side-by-side */
  lg:gap-8          /* Desktop: larger gap */
">
  <div className="
    w-full          /* Mobile: full width */
    md:w-1/2        /* Tablet+: half width */
    lg:w-1/3        /* Desktop: one-third width */
  ">
    Sidebar
  </div>
  <div className="flex-1">
    Main content
  </div>
</div>
```

### Container Queries

For component-level responsive design:

```tsx
<div className="@container">
  <div className="
    grid grid-cols-1
    @md:grid-cols-2
    @lg:grid-cols-3
  ">
    {/* Cards adapt to container width */}
  </div>
</div>
```

## Font Configuration

### Font Loading Strategy

Fonts are loaded via Google Fonts CDN with `display=swap`:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap");
```

**`display=swap`**: Ensures text is visible immediately with a fallback font, swapping to the custom font once loaded.

### Local Font Fallbacks

```javascript
// tailwind.config.js
fontFamily: {
  inter: ["var(--font-inter)", "sans-serif"],
  serif: ["var(--font-source-serif-pro)", "Georgia", "serif"],
  "comic-mono": ['"Comic Mono"', "ui-monospace", "monospace"],
}
```

### Font Loading from NPM

Comic Mono is loaded from npm package:

```typescript
import "@fontsource/comic-mono";
```

**WHY**: Self-hosted fonts reduce external dependencies and improve privacy.

## Tailwind Plugins

### tailwindcss-animate

Provides animation utilities:

```tsx
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  Animated entrance
</div>

<div className="animate-out fade-out slide-out-to-top-4 duration-200">
  Animated exit
</div>
```

**Common animations**:
- `animate-spin` - Loading spinners
- `animate-pulse` - Skeleton loaders
- `animate-bounce` - Attention grabbers
- `fade-in` / `fade-out` - Opacity transitions
- `slide-in-from-*` / `slide-out-to-*` - Directional slides

### tailwind-scrollbar

Provides scrollbar styling utilities:

```tsx
<div className="
  overflow-y-auto
  scrollbar-thin
  scrollbar-thumb-gray-300
  scrollbar-track-transparent
">
  Scrollable content
</div>
```

## Safelist Configuration

Prevent Tailwind from purging dynamically-generated classes:

```javascript
// tailwind.config.js
safelist: [
  // Workflow icon colors
  "bg-slate-100", "text-slate-600",
  "bg-red-100", "text-red-600",
  "bg-blue-100", "text-blue-600",
  // ... all color variants
],
```

**WHY**: Dynamic class names like `bg-${color}-100` aren't detected by Tailwind's purge scanner and must be safelisted.

## Best Practices

### DO

- Use semantic color tokens (`bg-primary`, not `bg-forest-green`)
- Follow mobile-first responsive design
- Use utility classes instead of custom CSS
- Leverage CVA for component variants
- Use `cn()` for conditional styling
- Keep spacing consistent with Tailwind scale
- Use CSS variables for themeable values
- Add dark mode variants to all components

### DON'T

- Don't create custom CSS classes unnecessarily
- Don't hardcode colors (use tokens)
- Don't use inline styles
- Don't ignore accessibility (color contrast, focus states)
- Don't override Tailwind defaults without reason
- Don't use `!important` to fix specificity issues
- Don't forget to test dark mode
- Don't use absolute units (px) when relative units (rem) are better

## Anti-Patterns

### ❌ Custom CSS for Everything

```css
/* Bad: Custom CSS */
.my-button {
  background-color: #0b3d2e;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  color: white;
}
```

```tsx
/* Good: Utility classes */
<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
  Click me
</button>
```

### ❌ Hardcoded Colors

```tsx
/* Bad: Hardcoded color */
<div className="bg-[#0b3d2e]">Content</div>

/* Good: Semantic token */
<div className="bg-primary">Content</div>
```

### ❌ Overly Long Class Strings

```tsx
/* Bad: Unreadable */
<div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-start md:p-12 lg:max-w-4xl">

/* Good: Extract to component or variant */
const cardVariants = cva("...", { variants: { ... } });
<Card variant="centered" size="large">
```

### ❌ Mixing Approaches

```tsx
/* Bad: Mixing inline styles and utilities */
<div
  className="rounded-lg p-4"
  style={{ backgroundColor: '#0b3d2e' }}
>

/* Good: Use utilities consistently */
<div className="rounded-lg bg-primary p-4">
```

## Code Examples

### Complete Component with Styling

```typescript
import { cn } from "@/shared/utils/utils";
import { cva, type VariantProps } from "class-variance-authority";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive",
        success: "border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

function Alert({
  className,
  variant,
  icon,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      {icon && (
        <div className="mr-3 flex-shrink-0 text-lg">{icon}</div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Usage
<Alert variant="destructive" icon={<AlertTriangle />}>
  Something went wrong!
</Alert>
```

### Responsive Layout Example

```tsx
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <Nav />
        </div>
      </header>

      {/* Main content */}
      <div className="container py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Sidebar */}
          <aside className="
            w-full
            lg:w-64
            lg:sticky lg:top-20 lg:self-start
          ">
            <Sidebar />
          </aside>

          {/* Content */}
          <main className="flex-1">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map(card => (
                <Card key={card.id} {...card} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

## Next Steps

- [Component Library](./19-component-library.md) - shadcn/ui components and patterns
- [API Integration](./15-api-integration.md) - Using styled components with API data
