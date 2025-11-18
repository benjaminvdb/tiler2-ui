# Accessibility

This document outlines accessibility (a11y) practices and standards used in the Tiler2 UI project. These guidelines ensure the application is usable by everyone, including people with disabilities.

## Table of Contents

- [Accessibility Overview](#accessibility-overview)
- [ARIA Labels and Roles](#aria-labels-and-roles)
- [Keyboard Navigation](#keyboard-navigation)
- [Focus Management](#focus-management)
- [Screen Reader Support](#screen-reader-support)
- [Semantic HTML](#semantic-html)
- [Color Contrast](#color-contrast)
- [Interactive Elements](#interactive-elements)
- [Form Accessibility](#form-accessibility)
- [Modal and Dialog Accessibility](#modal-and-dialog-accessibility)
- [Radix UI Accessibility Features](#radix-ui-accessibility-features)
- [Testing Accessibility](#testing-accessibility)
- [WCAG Guidelines Compliance](#wcag-guidelines-compliance)
- [Accessibility Checklist](#accessibility-checklist)

## Accessibility Overview

### Why Accessibility Matters

**Legal requirements:**
- ADA (Americans with Disabilities Act)
- Section 508
- EU Web Accessibility Directive

**User benefits:**
- 15% of world population has some form of disability
- Temporary disabilities (broken arm, eye surgery)
- Situational disabilities (bright sunlight, noisy environment)
- Aging population with declining abilities

**Technical benefits:**
- Better SEO (semantic HTML, ARIA)
- Improved keyboard navigation benefits power users
- Enhanced mobile experience
- More robust, maintainable code

### WCAG 2.1 Levels

The project targets **WCAG 2.1 Level AA** compliance:

- **Level A**: Basic accessibility (minimum)
- **Level AA**: Recommended standard (target)
- **Level AAA**: Enhanced accessibility (aspirational)

### Four Principles (POUR)

1. **Perceivable**: Information must be presentable to users in ways they can perceive
2. **Operable**: UI components must be operable by all users
3. **Understandable**: Information and operation must be understandable
4. **Robust**: Content must work with current and future technologies

## ARIA Labels and Roles

### When to Use ARIA

**First Rule of ARIA**: Don't use ARIA if you can use native HTML.

```tsx
// Bad - unnecessary ARIA
<div role="button" tabIndex={0} onClick={handleClick}>
  Click me
</div>

// Good - native button
<button onClick={handleClick}>Click me</button>
```

**Why:** Native HTML elements have built-in accessibility, keyboard support, and semantics.

### ARIA Labels for Icon Buttons

Example from `/home/user/tiler2-ui/src/features/side-panel/components/thread-actions-menu.tsx`:

```tsx
<button
  onClick={(e) => e.stopPropagation()}
  aria-label="Thread actions"
>
  <MoreHorizontal className="h-4 w-4" />
</button>
```

**Why:** Screen readers need text alternatives for icon-only buttons.

### ARIA Labels for File Input

Example from `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`:

```tsx
<button
  type="button"
  onClick={handleFileUploadClick}
  aria-label="Attach file"
>
  <Plus className="h-4 w-4" strokeWidth={2} />
</button>
```

**Patterns for icon buttons:**

```tsx
// Good - descriptive aria-label
<button aria-label="Delete thread">
  <Trash2 className="h-4 w-4" />
</button>

// Good - with visible label
<button>
  <Edit2 className="mr-2 h-4 w-4" />
  Edit
</button>

// Bad - no label
<button>
  <Trash2 className="h-4 w-4" />
</button>
```

### ARIA Live Regions

**Announce dynamic content changes:**

```tsx
// Loading/error messages
<div role="status" aria-live="polite">
  {isLoading && "Loading data..."}
</div>

// Urgent alerts
<div role="alert" aria-live="assertive">
  {error && `Error: ${error}`}
</div>
```

**Live region politeness levels:**
- `polite`: Announces when user is idle (default)
- `assertive`: Interrupts screen reader immediately
- `off`: No announcements

### ARIA Expanded/Collapsed

**For expandable content:**

```tsx
function CollapsibleSection({ title, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls="content-section"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      <div
        id="content-section"
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
```

**Why:** `aria-expanded` tells screen readers whether content is visible.

### ARIA Described By

**Link errors to form fields:**

```tsx
function EmailInput({ value, onChange, error }: Props) {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && (
        <span id="email-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Why:** Associates error messages with inputs for screen reader users.

## Keyboard Navigation

### Tab Order

**Ensure logical tab order:**

```tsx
// Good - native tab order
<form>
  <input name="firstName" />
  <input name="lastName" />
  <input name="email" />
  <button type="submit">Submit</button>
</form>

// Bad - manipulated tab order
<form>
  <input name="firstName" tabIndex={3} />
  <input name="lastName" tabIndex={1} />
  <input name="email" tabIndex={2} />
  <button type="submit" tabIndex={4}>Submit</button>
</form>
```

**Why:** Natural tab order follows DOM order. Custom `tabIndex` values create confusion.

### Interactive Elements

**All interactive elements must be keyboard accessible:**

```tsx
// Bad - div with onClick only
<div onClick={handleClick}>Click me</div>

// Good - button is keyboard accessible by default
<button onClick={handleClick}>Click me</button>

// If you must use div, add keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

**Why:** Keyboard-only users can't interact with non-keyboard-accessible elements.

### Skip Links

**Provide skip navigation links:**

```tsx
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-white focus:p-4"
      >
        Skip to main content
      </a>
      <nav>
        {/* Navigation */}
      </nav>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}
```

**Why:** Skip links help keyboard users bypass repetitive navigation.

### Keyboard Shortcuts

The project uses `react-hotkeys-hook` for keyboard shortcuts. Example usage:

```tsx
import { useHotkeys } from "react-hotkeys-hook";

function Component() {
  // Ctrl/Cmd + K to open search
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    openSearch();
  });

  // Escape to close dialog
  useHotkeys("escape", () => {
    closeDialog();
  });

  return <div>Content</div>;
}
```

**Document keyboard shortcuts:**

```tsx
function KeyboardShortcutsHelp() {
  return (
    <table>
      <caption>Keyboard Shortcuts</caption>
      <tbody>
        <tr>
          <td><kbd>Ctrl</kbd> + <kbd>K</kbd></td>
          <td>Open search</td>
        </tr>
        <tr>
          <td><kbd>Escape</kbd></td>
          <td>Close dialog</td>
        </tr>
        <tr>
          <td><kbd>Enter</kbd></td>
          <td>Submit form</td>
        </tr>
        <tr>
          <td><kbd>Shift</kbd> + <kbd>Enter</kbd></td>
          <td>New line in textarea</td>
        </tr>
      </tbody>
    </table>
  );
}
```

## Focus Management

### Focus Styles

**Always provide visible focus indicators:**

```css
/* Good - visible focus ring */
button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Bad - removing focus styles */
button:focus {
  outline: none; /* Don't do this! */
}
```

Example from button component configuration:

```tsx
const buttonVariants = cva(
  "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  // ... variants
);
```

**Why:** Focus indicators help keyboard users know where they are on the page.

### Focus Trap in Modals

**Trap focus inside open modals:**

Radix UI Dialog automatically handles focus trapping:

```tsx
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

function MyDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Focus is trapped here when dialog is open */}
        <input autoFocus />
        <button>Confirm</button>
        <button>Cancel</button>
      </DialogContent>
    </Dialog>
  );
}
```

**Manual focus trap (if not using Radix):**

```tsx
function FocusTrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener("keydown", handleTabKey);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

**Why:** Focus traps prevent keyboard users from tabbing outside modals.

### Restoring Focus

**Return focus after modal closes:**

```tsx
function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    // Restore focus to trigger button
    triggerRef.current?.focus();
  };

  return { isOpen, open, close, triggerRef };
}
```

**Why:** Restoring focus maintains user's position in the page.

## Screen Reader Support

### Screen Reader Only Text

**Utility class for screen-reader-only content:**

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Usage:**

```tsx
// Close button with icon and screen reader text
<button>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

Example from `/home/user/tiler2-ui/src/shared/components/ui/dialog.tsx`:

```tsx
<DialogPrimitive.Close>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

**Why:** Provides context for screen reader users without cluttering visual interface.

### ARIA Roles for Landmarks

**Use landmark roles for page regions:**

```tsx
function Layout() {
  return (
    <>
      <header role="banner">
        <nav role="navigation">
          {/* Navigation links */}
        </nav>
      </header>

      <main role="main">
        {/* Main content */}
      </main>

      <aside role="complementary">
        {/* Sidebar */}
      </aside>

      <footer role="contentinfo">
        {/* Footer */}
      </footer>
    </>
  );
}
```

**Why:** Landmark roles help screen reader users navigate page sections.

### Descriptive Link Text

```tsx
// Bad - vague link text
<a href="/article/123">Click here</a>
<a href="/article/123">Read more</a>

// Good - descriptive link text
<a href="/article/123">Read the full article about accessibility</a>

// Good - with sr-only context
<a href="/article/123">
  Read more
  <span className="sr-only"> about accessibility best practices</span>
</a>
```

**Why:** Screen reader users often navigate by links. Descriptive text provides context.

## Semantic HTML

### Use Semantic Elements

```tsx
// Good - semantic HTML
<article>
  <header>
    <h1>Article Title</h1>
    <time dateTime="2024-01-15">January 15, 2024</time>
  </header>
  <section>
    <p>Content...</p>
  </section>
  <footer>
    <p>Author: John Doe</p>
  </footer>
</article>

// Bad - div soup
<div className="article">
  <div className="header">
    <div className="title">Article Title</div>
    <div className="date">January 15, 2024</div>
  </div>
  <div className="content">
    <div>Content...</div>
  </div>
  <div className="footer">
    <div>Author: John Doe</div>
  </div>
</div>
```

**Why:** Semantic HTML provides meaning to assistive technologies and improves SEO.

### Heading Hierarchy

**Maintain proper heading levels:**

```tsx
// Good - logical hierarchy
<h1>Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>

// Bad - skipping levels
<h1>Page Title</h1>
  <h4>Section 1</h4> {/* Skipped h2 and h3 */}
  <h2>Section 2</h2>
```

**Why:** Screen readers use headings for navigation. Proper hierarchy creates a coherent document outline.

### Lists

**Use lists for related items:**

```tsx
// Good - semantic list
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

// Bad - div-based list
<div>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**Why:** Lists announce item count and position to screen readers.

## Color Contrast

### WCAG Contrast Requirements

**Level AA (minimum):**
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (≥ 18pt or 14pt bold): 3:1 contrast ratio

**Level AAA (enhanced):**
- Normal text: 7:1 contrast ratio
- Large text: 4.5:1 contrast ratio

### Checking Contrast

**Tools:**
- Chrome DevTools (Accessibility panel)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Calculator](https://contrast-ratio.com/)

**Example contrast checks:**

```tsx
// Good - sufficient contrast
<button className="bg-forest-green text-white">
  Submit {/* Green: #0B3D2E, White: #FFFFFF = 7.3:1 ✓ */}
</button>

// Bad - insufficient contrast
<button className="bg-gray-200 text-gray-300">
  Submit {/* Gray 200: #E5E7EB, Gray 300: #D1D5DB = 1.2:1 ✗ */}
</button>
```

### Don't Rely on Color Alone

```tsx
// Bad - color only
<span className="text-red-500">Error</span>
<span className="text-green-500">Success</span>

// Good - color + icon
<span className="text-red-500">
  <AlertCircle className="inline mr-1" />
  Error
</span>
<span className="text-green-500">
  <CheckCircle className="inline mr-1" />
  Success
</span>
```

**Why:** Color-blind users and screen readers can't distinguish color differences.

## Interactive Elements

### Button vs Link

**Use buttons for actions, links for navigation:**

```tsx
// Good - button for action
<button onClick={handleSubmit}>Submit Form</button>
<button onClick={handleDelete}>Delete Item</button>

// Good - link for navigation
<Link to="/profile">View Profile</Link>
<a href="https://example.com">Visit Website</a>

// Bad - link styled as button for action
<a href="#" onClick={handleSubmit}>Submit Form</a>
```

**Why:** Semantic correctness helps assistive technologies understand element purpose.

### Disabled State

**Clearly indicate disabled state:**

```tsx
<button
  disabled={isLoading}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? "Loading..." : "Submit"}
</button>
```

**Accessible disabled pattern:**

```tsx
<button
  aria-disabled={isLoading}
  onClick={(e) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    handleSubmit();
  }}
>
  {isLoading ? "Loading..." : "Submit"}
</button>
```

**Why:** `disabled` attribute removes element from tab order. `aria-disabled` keeps it focusable for screen reader announcement.

### Loading States

**Announce loading states:**

```tsx
function LoadingButton({ isLoading, children, ...props }: Props) {
  return (
    <button {...props} aria-busy={isLoading}>
      {isLoading && (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="sr-only">Loading</span>
        </>
      )}
      {children}
    </button>
  );
}
```

Example from `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`:

```tsx
<button
  type={isLoading ? "button" : "submit"}
  onClick={isLoading ? onStop : undefined}
  disabled={!input.trim() && !isLoading}
>
  {isLoading ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
  ) : (
    <Send className="h-3.5 w-3.5" strokeWidth={2} />
  )}
</button>
```

**Why:** `aria-busy` tells screen readers the element is in a loading state.

## Form Accessibility

### Label Association

**Every input must have an associated label:**

```tsx
// Good - explicit label association
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// Good - implicit association
<label>
  Email
  <input type="email" name="email" />
</label>

// Bad - no label
<input type="email" placeholder="Email" />
```

**Why:** Labels provide accessible names for screen readers and expand click target.

### Required Fields

**Indicate required fields:**

```tsx
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

**Why:** Visual and programmatic indication helps all users understand requirements.

### Field Validation

**Provide helpful error messages:**

```tsx
function FormField({ value, onChange, error }: Props) {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && (
        <span
          id="email-error"
          role="alert"
          className="text-red-500 text-sm"
        >
          {error}
        </span>
      )}
    </div>
  );
}
```

**Why:** `aria-invalid` and `aria-describedby` associate errors with fields for screen readers.

### Form Submission

**Announce form submission results:**

```tsx
function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitForm();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      {/* Announce results */}
      <div role="status" aria-live="polite">
        {status === "success" && "Form submitted successfully!"}
        {status === "error" && "Failed to submit form. Please try again."}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Modal and Dialog Accessibility

### Dialog Structure

Radix UI Dialog provides accessible dialogs out of the box. Example from `/home/user/tiler2-ui/src/shared/components/ui/dialog.tsx`:

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";

<Dialog>
  <DialogTrigger asChild>
    <button>Open Dialog</button>
  </DialogTrigger>

  <DialogContent>
    {/* Radix automatically handles:
        - Focus trap
        - Focus restoration
        - Escape key to close
        - aria-modal="true"
        - aria-labelledby
        - aria-describedby
    */}

    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description for screen readers
      </DialogDescription>
    </DialogHeader>

    <div>Dialog content</div>

    <DialogFooter>
      <button>Cancel</button>
      <button>Confirm</button>
    </DialogFooter>

    <DialogClose>
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogClose>
  </DialogContent>
</Dialog>
```

**Why Radix UI is accessible by default:**
- Proper ARIA attributes
- Keyboard support (Escape to close, Tab trap)
- Focus management
- Screen reader announcements

### Alert Dialogs

**For dialogs requiring user decision:**

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from "@/shared/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
    <AlertDialogDescription>
      This action cannot be undone. This will permanently delete your account
      and remove your data from our servers.
    </AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Yes, delete account
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Why:** Alert dialogs use `role="alertdialog"` to announce importance to screen readers.

## Radix UI Accessibility Features

### Built-in Accessibility

Radix UI components include accessibility features:

**Dropdown Menu:**
- Keyboard navigation (Arrow keys, Enter, Space)
- Focus management
- ARIA attributes (`aria-expanded`, `aria-haspopup`)
- Escape to close

**Tooltip:**
- Hover and focus trigger
- `aria-describedby` association
- Portal rendering (avoiding z-index issues)

**Switch:**
- `role="switch"`
- `aria-checked` state
- Keyboard support (Space to toggle)

**Separator:**
- `role="separator"`
- Proper ARIA orientation

### Example: Accessible Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button aria-label="Open menu">
      <MoreHorizontal />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={handleEdit}>
      <Edit2 className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={handleDelete}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Radix automatically provides:**
- Keyboard navigation (↑↓ arrows, Enter, Space)
- Focus management
- Escape to close
- Click outside to close
- ARIA attributes

## Testing Accessibility

### Automated Testing Tools

**Browser Extensions:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

**Run Lighthouse audit:**

```bash
# In Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to "Lighthouse" tab
# 3. Select "Accessibility" category
# 4. Click "Generate report"
```

### Manual Testing

**Keyboard-only navigation:**

1. Unplug mouse (or don't use it)
2. Navigate using:
   - `Tab` - Next focusable element
   - `Shift + Tab` - Previous focusable element
   - `Enter` - Activate buttons/links
   - `Space` - Activate buttons, checkboxes
   - `Arrow keys` - Navigate menus, radios
   - `Escape` - Close dialogs/menus

**Screen reader testing:**

- **Windows**: [NVDA](https://www.nvaccess.org/) (free)
- **macOS**: VoiceOver (built-in, Cmd+F5)
- **Linux**: [Orca](https://help.gnome.org/users/orca/stable/)

**Color contrast testing:**

```bash
# Chrome DevTools
# 1. Inspect element
# 2. Open "Styles" panel
# 3. Click color swatch
# 4. View contrast ratio
```

### Testing Checklist

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All buttons have accessible names
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] No keyboard traps
- [ ] Skip links work
- [ ] Headings are hierarchical
- [ ] ARIA attributes are correct
- [ ] Screen reader announcements make sense
- [ ] Error messages are descriptive

## WCAG Guidelines Compliance

### Level A (Minimum)

**1.1.1 Non-text Content:**
- All images have alt text
- Decorative images have `alt=""`
- Icon buttons have `aria-label`

**2.1.1 Keyboard:**
- All functionality available via keyboard
- No keyboard traps

**3.1.1 Language of Page:**
```html
<html lang="en">
```

**4.1.2 Name, Role, Value:**
- All UI components have accessible names
- States are programmatically determinable

### Level AA (Target)

**1.4.3 Contrast (Minimum):**
- Text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

**1.4.5 Images of Text:**
- Avoid text in images (use actual text)

**2.4.3 Focus Order:**
- Focus order is logical and meaningful

**2.4.7 Focus Visible:**
- Focus indicator is visible

**3.2.3 Consistent Navigation:**
- Navigation is consistent across pages

**3.3.1 Error Identification:**
- Errors are clearly identified
- Suggestions provided for correction

**3.3.2 Labels or Instructions:**
- All inputs have labels
- Instructions are provided

### Level AAA (Aspirational)

**1.4.6 Contrast (Enhanced):**
- Text: 7:1 contrast ratio
- Large text: 4.5:1 contrast ratio

**2.1.3 Keyboard (No Exception):**
- All functionality via keyboard, no exceptions

**2.4.8 Location:**
- User knows their location in the site

## Accessibility Checklist

### Before Development

- [ ] Design includes focus states
- [ ] Design meets color contrast requirements
- [ ] Design accounts for keyboard navigation
- [ ] Interactive elements are clearly indicated

### During Development

- [ ] Use semantic HTML
- [ ] Add alt text to images
- [ ] Associate labels with inputs
- [ ] Provide focus indicators
- [ ] Test keyboard navigation
- [ ] Add ARIA attributes where needed
- [ ] Ensure proper heading hierarchy
- [ ] Test with screen reader

### Before Deployment

- [ ] Run Lighthouse accessibility audit
- [ ] Run axe DevTools
- [ ] Perform manual keyboard testing
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Check focus management
- [ ] Test with zoom (200%)
- [ ] Test on mobile with screen reader

### Ongoing

- [ ] Maintain accessibility in code reviews
- [ ] Update documentation
- [ ] Monitor accessibility metrics
- [ ] Address user feedback
- [ ] Stay current with WCAG updates

## Resources

**Official Guidelines:**
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

**Testing Tools:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Learning Resources:**
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)

## Next Steps

You've completed the Code Patterns section! Continue to the Testing & Deployment section or revisit:

- **[20-coding-conventions.md](/home/user/tiler2-ui/docs/20-coding-conventions.md)** - TypeScript and code conventions
- **[21-react-patterns.md](/home/user/tiler2-ui/docs/21-react-patterns.md)** - React component patterns
- **[22-performance.md](/home/user/tiler2-ui/docs/22-performance.md)** - Performance optimization

---

**Related Documentation:**
- [19-component-library.md](/home/user/tiler2-ui/docs/19-component-library.md) - UI component library (Radix UI)
- [18-styling-theming.md](/home/user/tiler2-ui/docs/18-styling-theming.md) - Styling and theming

**Key Components:**
- `/home/user/tiler2-ui/src/shared/components/ui/dialog.tsx` - Accessible dialog
- `/home/user/tiler2-ui/src/shared/components/ui/button.tsx` - Accessible button
- `/home/user/tiler2-ui/src/shared/components/ui/dropdown-menu.tsx` - Accessible dropdown
