# Workflows

The workflow system provides pre-configured conversation templates for specific sustainability tasks. Workflows guide users through structured interactions with domain-specific context and best practices.

## Why This Exists

Rather than starting with a blank chat, users can select workflows tailored to their needs (e.g., "Climate Risk Assessment", "CSRD Reporting"). Each workflow initializes the conversation with specific context, tools, and guidance. This reduces cognitive load and ensures users follow best practices for complex sustainability tasks.

## Workflow Configuration Structure

Workflows are defined in the backend database and fetched via API.

**Type Definition:**
```typescript
interface WorkflowConfig {
  id: number;                    // Database ID
  workflow_id: string;           // Unique identifier (kebab-case)
  title: string;                 // Display name
  description: string;           // User-facing description
  icon: string;                  // Lucide icon name
  icon_color: string;            // Hex color for icon
  order_index: number;           // Display order
  category: CategoryResponse;    // Workflow category
}

interface CategoryResponse {
  id: number;
  name: string;                  // Category name
  color: string;                 // Hex color
  icon_name: string;             // Lucide icon name
  order_index: number;           // Display order
}
```

**Example:**
```typescript
{
  id: 1,
  workflow_id: "climate-risk-assessment",
  title: "Climate Risk Assessment",
  description: "Identify and assess climate-related risks to your organization",
  icon: "cloud-lightning",
  icon_color: "#72a6a6",
  order_index: 1,
  category: {
    id: 4,
    name: "Impacts & Risk Assessment",
    color: "#72a6a6",
    icon_name: "alert-triangle",
    order_index: 4
  }
}
```

## Workflow Categories

Workflows are organized into categories for easier navigation.

**Standard Categories:**
1. **Onboarding** - Getting started guides
2. **Strategy** - Strategic planning
3. **Policies & Governance** - Policy development
4. **Impacts & Risk Assessment** - Risk and impact analysis
5. **Interventions** - Action planning
6. **Standards & Reporting** - Compliance and reporting
7. **Stakeholder Engagement** - Stakeholder management
8. **Knowledge & Guidance** - General information

**Category Configuration:**
```typescript
const CATEGORY_COLORS: Record<string, string> = {
  "Onboarding": "#767C91",
  "Strategy": "#82889f",
  "Policies & Governance": "#7ca2b7",
  "Impacts & Risk Assessment": "#72a6a6",
  "Interventions": "#a6c887",
  "Standards & Reporting": "#e39c5a",
  "Stakeholder Engagement": "#ac876c",
  "Knowledge & Guidance": "#878879",
};
```

Each category has:
- Unique color for visual distinction
- Icon from Lucide library
- Decorative illustration (fern, beetle, leaves)
- Display order

## Loading Workflows from API

Workflows are fetched on page load from the backend.

**File:** `/home/user/tiler2-ui/src/app/workflows/page.tsx`

**Implementation:**
```typescript
const [workflows, setWorkflows] = useState<WorkflowConfig[]>(BUILT_IN_WORKFLOWS);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const fetchWithAuth = useAuthenticatedFetch();

useEffect(() => {
  const fetchWorkflows = async () => {
    try {
      setLoading(true);

      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      const response = await fetchWithAuth(`${apiUrl}/workflows`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const dynamicWorkflows: WorkflowConfig[] = await response.json();
        setWorkflows(mergeWithBuiltIns(dynamicWorkflows));
        setError(null);
      } else {
        throw new Error(`Failed to fetch workflows: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error fetching dynamic workflows:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dynamic workflows",
      );
      setWorkflows(BUILT_IN_WORKFLOWS);
    } finally {
      setLoading(false);
    }
  };

  fetchWorkflows();
}, [apiUrl, fetchWithAuth]);
```

**Endpoint:** `GET /workflows`

**Response:**
```json
[
  {
    "id": 1,
    "workflow_id": "climate-risk-assessment",
    "title": "Climate Risk Assessment",
    "description": "Identify and assess climate risks",
    "icon": "cloud-lightning",
    "icon_color": "#72a6a6",
    "order_index": 1,
    "category": {
      "id": 4,
      "name": "Impacts & Risk Assessment",
      "color": "#72a6a6",
      "icon_name": "alert-triangle",
      "order_index": 4
    }
  }
]
```

**Fallback Behavior:**
- On error: Show built-in workflows (currently empty)
- On timeout: Display error message
- No workflows: Show helpful message

## Workflow Selection UI

The workflow selection page presents workflows in a grid with search.

### Layout

**Desktop:**
- Grid layout (3 columns)
- Grouped by category
- Category navigation chips at top
- Smooth scroll to category sections

**Mobile:**
- Single column
- Bottom sheet for category selection
- Responsive cards

### Search Functionality

```typescript
const [searchQuery, setSearchQuery] = useState("");

const filteredWorkflows = useMemo(() => {
  if (!searchQuery.trim()) {
    return workflows;
  }

  const query = searchQuery.toLowerCase();
  return workflows.filter(
    (w) =>
      w.title.toLowerCase().includes(query) ||
      w.description.toLowerCase().includes(query),
  );
}, [workflows, searchQuery]);
```

**Features:**
- Real-time filtering
- Searches title and description
- Shows count of results
- Clear button to reset

### Workflow Card

Each workflow displays as an interactive card:

**Visual Elements:**
- Category badge (colored, with icon)
- Title (serif font, 18px)
- Description (14px, muted)
- Background illustration (15% opacity)
- Hover effect (lift + shadow)

**Implementation:**
```typescript
<motion.button
  onClick={() => handleWorkflowClick(workflow.workflow_id)}
  className="group relative overflow-hidden rounded-lg border bg-white"
  whileHover={{ y: -1, transition: { duration: 0.2 } }}
  style={{ minHeight: "280px" }}
>
  {/* Background illustration */}
  <img
    src={illustrationSrc}
    alt=""
    className="absolute right-0 bottom-0"
    style={{
      opacity: 0.15,
      transform: "translate(20%, 20%) scale(1.4)",
    }}
  />

  {/* Hover shadow */}
  <div
    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
    style={{
      boxShadow: `0 12px 40px ${categoryColor}20`,
    }}
  />

  {/* Content */}
  <div className="relative z-10 flex flex-col px-7 pt-7 pb-8">
    {/* Category badge */}
    <div
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1"
      style={{ backgroundColor: categoryColor }}
    >
      <span>{getWorkflowIcon(workflow.category.icon_name)}</span>
      <span className="text-[11px] uppercase text-white">
        {workflow.category.name}
      </span>
    </div>

    {/* Title */}
    <h4 className="mb-4 font-serif text-[18px]">
      {workflow.title}
    </h4>

    {/* Description */}
    <p className="text-muted-foreground text-[14px]">
      {workflow.description}
    </p>
  </div>
</motion.button>
```

### Category Navigation

Quick jump navigation to category sections:

```typescript
const scrollToCategory = (categoryName: string) => {
  categoryRefs.current[categoryName]?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

// Category chips
<div className="flex flex-wrap gap-2">
  {categories.map((category) => (
    <button
      key={category.id}
      onClick={() => scrollToCategory(category.name)}
      style={{ backgroundColor: getCategoryColorByName(category.name) }}
    >
      <span>{getWorkflowIcon(category.icon_name)}</span>
      <span>{category.name}</span>
    </button>
  ))}
</div>
```

## Workflow Initialization

When a workflow is selected, it initializes a new conversation.

### Selection Flow

```typescript
const handleWorkflowClick = (workflowId: string) => {
  navigationService.navigateToWorkflow(workflowId);
};

// NavigationService implementation
navigateToWorkflow: (workflowId: string) => {
  const workflow = workflows.find(w => w.workflow_id === workflowId);
  if (!workflow) return;

  // Generate new thread ID
  const threadId = crypto.randomUUID();

  // Build optimistic thread with workflow metadata
  const optimisticThread = buildOptimisticThread({
    threadId,
    threadName: workflow.title,
    userEmail: user.email,
  });

  // Add workflow metadata
  optimisticThread.metadata.workflow_id = workflow.workflow_id;
  optimisticThread.metadata.workflow_title = workflow.title;

  // Add to threads list
  addOptimisticThread(optimisticThread);

  // Navigate to chat
  navigate(`/?thread_id=${threadId}&workflow_id=${workflowId}`);
};
```

### Backend Workflow Handling

The backend receives `workflow_id` in the thread metadata and:
1. Loads workflow configuration
2. Sets system prompt
3. Enables workflow-specific tools
4. Initializes workflow state
5. May send initial message to guide user

**Example Backend Flow:**
```python
if thread.metadata.get("workflow_id") == "climate-risk-assessment":
    # Load workflow config
    config = load_workflow_config("climate-risk-assessment")

    # Set system prompt
    system_prompt = config["system_prompt"]

    # Enable tools
    tools = [
        "search_climate_data",
        "risk_assessment_framework",
        "tcfd_alignment_check"
    ]

    # Initialize state
    state = {
        "workflow": "climate-risk-assessment",
        "stage": "intake",
        "collected_data": {}
    }
```

## Workflow Metadata in Threads

Workflow information is stored in thread metadata.

**Structure:**
```typescript
{
  thread_id: "uuid-here",
  metadata: {
    name: "Climate Risk Assessment",
    owner: "user@example.com",
    assistant_id: "assistant-uuid",
    workflow_id: "climate-risk-assessment",     // Workflow identifier
    workflow_title: "Climate Risk Assessment",  // Display name
    category: "Impacts & Risk Assessment"       // Category name
  }
}
```

**Benefits:**
1. **Resume workflows** - Continue where user left off
2. **Filter threads** - Show only specific workflow type
3. **Display context** - Show workflow icon in thread list
4. **Analytics** - Track workflow usage

**Usage in Thread List:**
```typescript
const workflowIcon = thread.metadata.workflow_id
  ? getWorkflowIcon(workflow.icon)
  : <MessageSquare />;

<div className="thread-item">
  <div className="icon">{workflowIcon}</div>
  <div className="name">{thread.metadata.name}</div>
</div>
```

## Icon Resolution

Workflow icons use Lucide icon library.

**Implementation:**
```typescript
const toPascalCase = (value: string): string =>
  value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, "");

const getWorkflowIcon = (iconName: string): React.ReactNode => {
  const iconComponentName = toPascalCase(iconName);
  const IconComponent =
    lucideIconLibrary[iconComponentName] ?? LucideIcons.HelpCircle;
  return <IconComponent className="h-5 w-5" />;
};
```

**Examples:**
- `"cloud-lightning"` → `CloudLightning`
- `"alert-triangle"` → `AlertTriangle`
- `"file-text"` → `FileText`
- Invalid → `HelpCircle` (fallback)

## Built-in vs. Dynamic Workflows

### Built-in Workflows

Hardcoded fallbacks if API fails.

```typescript
const BUILT_IN_WORKFLOWS: WorkflowConfig[] = [
  // Currently empty, but can add defaults here
];
```

### Dynamic Workflows

Loaded from backend API.

**Merge Strategy:**
```typescript
const mergeWithBuiltIns = (
  dynamicWorkflows: WorkflowConfig[],
): WorkflowConfig[] => {
  const existingIds = new Set(
    BUILT_IN_WORKFLOWS.map((workflow) => workflow.workflow_id)
  );

  const uniqueDynamicWorkflows = dynamicWorkflows.filter(
    (workflow) => !existingIds.has(workflow.workflow_id),
  );

  return [...BUILT_IN_WORKFLOWS, ...uniqueDynamicWorkflows].sort(
    (a, b) => a.order_index - b.order_index,
  );
};
```

**Logic:**
1. Built-in workflows always included
2. Dynamic workflows added if not duplicates
3. Sorted by `order_index`

## Best Practices

### 1. Workflow Naming

```typescript
// ✅ Good - Clear, specific
"Climate Risk Assessment"
"CSRD Double Materiality Analysis"
"Scope 3 Emissions Calculation"

// ❌ Bad - Vague, generic
"Risk Analysis"
"Reporting"
"Calculate Stuff"
```

### 2. Description Writing

```typescript
// ✅ Good - Action-oriented, specific
"Identify and assess climate-related risks to your organization using TCFD framework"

// ❌ Bad - Passive, unclear
"This workflow helps with risk stuff"
```

### 3. Category Organization

- Keep categories focused (5-10 workflows each)
- Use consistent naming
- Assign clear, distinct colors
- Order by user journey flow

### 4. Icon Selection

- Choose relevant, recognizable icons
- Avoid overly complex icons
- Ensure icon exists in Lucide library
- Test fallback behavior

## Error Handling

### API Errors

```typescript
try {
  const response = await fetchWorkflows();
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
} catch (error) {
  console.error("Error fetching workflows:", error);
  setError(error.message);
  setWorkflows(BUILT_IN_WORKFLOWS); // Fallback
}
```

### Missing Workflows

```typescript
{filteredWorkflows.length === 0 && (
  <div className="text-center py-12">
    <p>No workflows found matching "{searchQuery}"</p>
    <Button onClick={() => setSearchQuery("")}>
      Clear search
    </Button>
  </div>
)}
```

### Invalid Icons

```typescript
// Fallback to HelpCircle if icon not found
const IconComponent =
  lucideIconLibrary[iconComponentName] ?? LucideIcons.HelpCircle;
```

## Performance Considerations

### Lazy Loading

For many workflows, implement lazy loading:

```typescript
const [displayedWorkflows, setDisplayedWorkflows] = useState(20);

const loadMore = () => {
  setDisplayedWorkflows(prev => prev + 20);
};
```

### Image Optimization

Category illustrations should be:
- SVG or optimized PNG
- Compressed
- Lazy loaded
- Cached

### Search Debouncing

```typescript
const debouncedSearch = useDebounce(searchQuery, 300);
```

## Accessibility

### Keyboard Navigation

- Tab through workflow cards
- Enter to select
- Arrow keys for category navigation

### Screen Readers

```typescript
<button
  aria-label={`Select ${workflow.title} workflow`}
  role="button"
>
  {/* Content */}
</button>
```

### Color Contrast

Ensure category colors meet WCAG AA standards:
- Text on colored backgrounds
- Badge readability
- Hover state visibility

## Related Documentation

- [Thread Management](/home/user/tiler2-ui/docs/09-thread-management.md) - Thread creation and metadata
- [Human-in-the-Loop](/home/user/tiler2-ui/docs/12-human-in-loop.md) - Workflow interrupts
- [Routing](/home/user/tiler2-ui/docs/07-routing.md) - Workflow URL parameters
- [Configuration](/home/user/tiler2-ui/docs/02-configuration.md) - API endpoints

---

**Next:** [Multimodal Support](/home/user/tiler2-ui/docs/11-multimodal.md)
