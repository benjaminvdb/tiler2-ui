# Component Library

This document covers the component library, including shadcn/ui integration, Radix UI primitives, custom components, composition patterns, accessibility features, and usage examples.

## shadcn/ui Overview

The application uses **shadcn/ui**, a collection of re-usable components built with Radix UI and Tailwind CSS. Unlike traditional component libraries, shadcn/ui components are copied into your project, giving you full ownership and customization control.

**WHY shadcn/ui**:
- **Not a dependency**: Components are copied into your codebase, not installed as a package
- **Full customization**: Modify components directly without fighting library constraints
- **Built on Radix UI**: Provides accessible primitives with proper ARIA attributes
- **Tailwind CSS**: Styled with utility classes for consistency
- **TypeScript**: Full type safety out of the box

### Configuration

**Location**: `/home/user/tiler2-ui/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Configuration Breakdown**:
- `style: "new-york"`: Uses the New York design style variant
- `rsc: false`: Not using React Server Components
- `cssVariables: true`: Uses CSS variables for theming
- `iconLibrary: "lucide"`: Uses Lucide React icons

## Installed Components

The following shadcn/ui components are installed in the project:

### Form Controls

**Button** (`/home/user/tiler2-ui/src/shared/components/ui/button.tsx`)
```typescript
import { Button } from "@/shared/components/ui/button";

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Subtle action</Button>
<Button variant="link">Link styled</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

**Input** (`/home/user/tiler2-ui/src/shared/components/ui/input.tsx`)
```typescript
import { Input } from "@/shared/components/ui/input";

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

**Textarea** (`/home/user/tiler2-ui/src/shared/components/ui/textarea.tsx`)
```typescript
import { Textarea } from "@/shared/components/ui/textarea";

<Textarea placeholder="Enter message..." rows={4} />
```

**Label** (`/home/user/tiler2-ui/src/shared/components/ui/label.tsx`)
```typescript
import { Label } from "@/shared/components/ui/label";

<Label htmlFor="email">Email address</Label>
<Input id="email" type="email" />
```

**Switch** (`/home/user/tiler2-ui/src/shared/components/ui/switch.tsx`)
```typescript
import { Switch } from "@/shared/components/ui/switch";

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Overlays

**Dialog** (`/home/user/tiler2-ui/src/shared/components/ui/dialog.tsx`)
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Sheet** (`/home/user/tiler2-ui/src/shared/components/ui/sheet.tsx`)
```typescript
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
      <SheetDescription>
        Configure your preferences
      </SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

**Dropdown Menu** (`/home/user/tiler2-ui/src/shared/components/ui/dropdown-menu.tsx`)
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Tooltip** (`/home/user/tiler2-ui/src/shared/components/ui/tooltip.tsx`)
```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <InfoIcon />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Data Display

**Avatar** (`/home/user/tiler2-ui/src/shared/components/ui/avatar.tsx`)
```typescript
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
</Avatar>
```

**Separator** (`/home/user/tiler2-ui/src/shared/components/ui/separator.tsx`)
```typescript
import { Separator } from "@/shared/components/ui/separator";

<Separator orientation="horizontal" />
<Separator orientation="vertical" className="h-8" />
```

**Skeleton** (`/home/user/tiler2-ui/src/shared/components/ui/skeleton.tsx`)
```typescript
import { Skeleton } from "@/shared/components/ui/skeleton";

<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Layout

**Sidebar** (`/home/user/tiler2-ui/src/shared/components/ui/sidebar.tsx`)
```typescript
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <h2>My App</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">Dashboard</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <main>
    <SidebarTrigger />
    {/* Page content */}
  </main>
</SidebarProvider>
```

### Feedback

**Sonner (Toast)** (`/home/user/tiler2-ui/src/shared/components/ui/sonner.tsx`)
```typescript
import { toast } from "sonner";

// Success toast
toast.success("Message sent successfully");

// Error toast
toast.error("Failed to send message");

// Warning toast
toast.warning("Your session will expire soon");

// Info toast
toast.info("New updates available");

// Custom duration
toast.success("Saved", { duration: 3000 });

// With action button
toast.error("Failed to delete", {
  action: {
    label: "Retry",
    onClick: () => handleRetry(),
  },
});
```

## Radix UI Primitives

shadcn/ui components are built on top of **Radix UI** primitives, which provide:

- **Accessibility**: Full keyboard navigation, screen reader support, ARIA attributes
- **Unstyled**: No default styles, full control over appearance
- **Composable**: Build complex components from simple primitives
- **Framework-agnostic**: Works with any styling solution

### Installed Radix Packages

From `/home/user/tiler2-ui/package.json`:

```json
{
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-dropdown-menu": "^2.1.15",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.5",
  "@radix-ui/react-tooltip": "^1.2.7"
}
```

### Example: Dialog Primitive

From `/home/user/tiler2-ui/src/shared/components/ui/dialog.tsx`:

```typescript
import * as DialogPrimitive from "@radix-ui/react-dialog";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
));

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-[50%] left-[50%] z-50",
        "translate-x-[-50%] translate-y-[-50%]",
        "w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute top-4 right-4">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
```

**WHY**: Radix handles all the complex accessibility and interaction logic, while we control the styling.

## Custom Components

### Custom Components Location

**Directory**: `/home/user/tiler2-ui/src/shared/components/`

**Examples**:
- `loading-spinner.tsx` - Loading indicator
- `error-boundary/` - Error boundary components
- `layout/` - Layout wrapper components

### Loading Spinner

```typescript
// /home/user/tiler2-ui/src/shared/components/loading-spinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
```

**Usage**:
```typescript
import { LoadingSpinner } from "@/shared/components/loading-spinner";

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Custom Password Input

```typescript
// /home/user/tiler2-ui/src/shared/components/ui/password-input.tsx
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
```

## Component Composition Patterns

### Compound Component Pattern

Used extensively in shadcn/ui components:

```typescript
// Dialog uses compound components
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**WHY**: Provides a clear, declarative API with logical component grouping.

### Polymorphic Component Pattern

Using Radix UI's `Slot` for component composition:

```typescript
// Button can render as any element
<Button asChild>
  <a href="/dashboard">Go to Dashboard</a>
</Button>

// Renders as: <a class="button-styles" href="/dashboard">...</a>
```

**Implementation** (from button component):

```typescript
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props} />;
};
```

**WHY**: Allows components to adapt to different HTML elements while maintaining styling and behavior.

### Controlled vs Uncontrolled

Components support both controlled and uncontrolled modes:

```typescript
// Uncontrolled (internal state)
<Switch defaultChecked={true} />

// Controlled (external state)
<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
```

### Render Props Pattern

For complex customization:

```typescript
<DataTable
  data={users}
  renderRow={(user) => (
    <tr key={user.id}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <Button onClick={() => handleEdit(user)}>Edit</Button>
      </td>
    </tr>
  )}
/>
```

## Accessibility Features

All shadcn/ui and Radix UI components include built-in accessibility:

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons, open menus
- **Escape**: Close dialogs, dropdowns
- **Arrow keys**: Navigate within menus, select options

### ARIA Attributes

Components automatically include proper ARIA attributes:

```typescript
// Dialog includes:
// role="dialog"
// aria-modal="true"
// aria-labelledby="dialog-title"
// aria-describedby="dialog-description"

<Dialog>
  <DialogContent>
    <DialogTitle id="dialog-title">Title</DialogTitle>
    <DialogDescription id="dialog-description">
      Description
    </DialogDescription>
  </DialogContent>
</Dialog>
```

### Focus Management

- Automatic focus trapping in dialogs
- Focus restoration when closing
- Proper tab order
- Visible focus indicators

```css
/* Focus ring is applied globally */
* {
  @apply outline-ring/50;
}

/* Custom focus styles */
.button {
  @apply focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

### Screen Reader Support

- Descriptive labels for all interactive elements
- Live regions for dynamic content
- Hidden elements properly marked with `sr-only`

```typescript
<button>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

## Usage Examples

### Confirmation Dialog

```typescript
function DeleteButton({ itemId, itemName }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteItem(itemId);
      toast.success(`${itemName} deleted successfully`);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemName}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### User Dropdown Menu

From `/home/user/tiler2-ui/src/features/auth/components/components/user-dropdown.tsx`:

```typescript
import { useAuth0 } from "@auth0/auth0-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

export function UserDropdown() {
  const { user, logout } = useAuth0();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <Avatar>
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback>
              {getInitials(user?.name || "U")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile">Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">Settings</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Form with Validation

```typescript
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    handleLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Log in
      </Button>
    </form>
  );
}
```

## Adding New shadcn Components

### Installation Command

```bash
npx shadcn@latest add <component-name>
```

**Examples**:
```bash
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add select
```

### What Happens

1. Component files are copied to `/home/user/tiler2-ui/src/shared/components/ui/`
2. Dependencies are added to `package.json`
3. Component is ready to use immediately

### Customizing After Installation

After installation, you can freely modify the component:

```typescript
// Customize button variants
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        // Add custom variant
        brand: "bg-forest-green text-white hover:bg-forest-green/90",
      },
    },
  },
);
```

## Customizing Components

### Extending Variants

Add new variants to existing components:

```typescript
// Extend Button with loading state
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  }
);
```

### Adding Custom Styles

Override or extend component styles:

```typescript
<Button
  className={cn(
    // Default button styles are applied
    "shadow-xl",           // Add custom shadow
    "transition-transform", // Add transform transition
    "active:scale-95",     // Scale down on click
  )}
>
  Click me
</Button>
```

### Creating Component Variants

Create wrapper components for common patterns:

```typescript
// IconButton wrapper
export function IconButton({ icon: Icon, label, ...props }: IconButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" {...props}>
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Usage
<IconButton icon={Trash} label="Delete item" onClick={handleDelete} />
```

## Best Practices

### DO

- Use shadcn/ui components as a foundation
- Customize components to match your design system
- Leverage Radix UI primitives for complex interactions
- Use compound components for clear APIs
- Implement proper accessibility attributes
- Test keyboard navigation
- Provide loading and error states
- Use TypeScript for type safety

### DON'T

- Don't bypass accessibility features
- Don't create custom components for things shadcn/ui provides
- Don't ignore ARIA attributes
- Don't use inline styles instead of Tailwind classes
- Don't forget to test with screen readers
- Don't remove focus indicators
- Don't create inaccessible custom components

## Anti-Patterns

### ❌ Reimplementing shadcn Components

```typescript
/* Bad: Custom implementation */
function MyDialog() {
  return (
    <div className="fixed inset-0" onClick={onClose}>
      <div className="bg-white p-4">...</div>
    </div>
  );
}

/* Good: Use shadcn Dialog */
import { Dialog } from "@/shared/components/ui/dialog";
```

### ❌ Breaking Composition

```typescript
/* Bad: Flattened structure */
<CustomDialog
  title="Delete"
  description="Are you sure?"
  actions={<Button>Delete</Button>}
/>

/* Good: Composable structure */
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### ❌ Skipping Accessibility

```typescript
/* Bad: No accessibility */
<button onClick={onClose}>
  <X />
</button>

/* Good: Accessible close button */
<button onClick={onClose} aria-label="Close dialog">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

## Next Steps

- [Styling & Theming](./18-styling-theming.md) - Tailwind CSS configuration and design tokens
- [Chat System](./08-chat-system.md) - Using components in the chat interface
