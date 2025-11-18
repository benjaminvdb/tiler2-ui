# Human-in-the-Loop

Human-in-the-loop (HITL) enables the AI to pause workflows and request user input for critical decisions. This ensures human oversight for important actions and allows users to guide the AI's behavior.

## Why This Exists

Some workflows require human judgment for critical decisions (e.g., approving financial transactions, confirming data changes, selecting between options). Rather than proceeding automatically, the AI can pause and present choices to the user, who then decides how to proceed. This pattern is essential for responsible AI systems handling sensitive tasks.

## Workflow Interrupts

Interrupts are special workflow states where the AI pauses execution.

**Type Definition:** `/home/user/tiler2-ui/src/shared/types/index.ts`
```typescript
/**
 * Represents a human-in-the-loop interrupt that pauses the AI workflow.
 * Allows the system to wait for user decision before proceeding.
 */
export interface InterruptItem {
  id: string;
  type: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * User's response to an interrupt, providing the args to resume the workflow.
 */
export interface InterruptResponse {
  type: "response";
  args: string;
}
```

**Thread Structure with Interrupt:**
```typescript
{
  thread_id: "uuid-here",
  status: "interrupted",  // Thread status changes to "interrupted"
  interrupts: {
    "checkpoint-id": {
      type: "action_request",
      action_request: {
        action: "send_email",
        args: {
          to: "stakeholder@company.com",
          subject: "Climate Report",
          body: "Please review..."
        }
      },
      config: {
        approve: true,   // Show approve button
        edit: true,      // Show edit button
        ignore: true     // Show ignore button
      }
    }
  }
}
```

## Interrupt Message Type

Interrupts are rendered as special message components.

**Chat Interrupt Component:** `/home/user/tiler2-ui/src/features/thread/components/messages/chat-interrupt.tsx`

```typescript
export const ChatInterrupt: React.FC<ChatInterruptProps> = ({
  interrupt,
  onAccept,
  onRespond,
  onEdit,
  onIgnore,
}) => {
  const questionText = getQuestionText(interrupt);
  const hasArgs = hasActionArgs(interrupt.action_request);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <InterruptHeader questionText={questionText} />
      <ActionDetails
        actionRequest={interrupt.action_request}
        hasArgs={hasArgs}
      />
      <ActionButtons
        config={interrupt.config}
        {...(onAccept && { onAccept })}
        {...(onEdit && { onEdit })}
        {...(onIgnore && { onIgnore })}
      />
      <InstructionText
        config={interrupt.config}
        hasArgs={hasArgs}
      />
    </div>
  );
};
```

**Visual Design:**
- Light blue background (`bg-blue-50/50`)
- Border for emphasis (`border-blue-200`)
- Header with question/prompt
- Action details (what the AI wants to do)
- Button group (Approve, Edit, Ignore)
- Instructions for user

## Interrupt UI Component

The interrupt UI consists of several sub-components.

### Interrupt Header

**File:** `/home/user/tiler2-ui/src/features/thread/components/messages/chat-interrupt/components/interrupt-header.tsx`

Shows the question or prompt:
```typescript
export const InterruptHeader = ({ questionText }: InterruptHeaderProps) => {
  return (
    <div className="flex items-start gap-2">
      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
      <div>
        <h4 className="font-semibold text-blue-900">
          Human Input Required
        </h4>
        <p className="text-sm text-blue-800 mt-1">
          {questionText}
        </p>
      </div>
    </div>
  );
};
```

### Action Details

**File:** `/home/user/tiler2-ui/src/features/thread/components/messages/chat-interrupt/components/action-details.tsx`

Displays what action the AI wants to perform:
```typescript
export const ActionDetails = ({ actionRequest, hasArgs }: ActionDetailsProps) => {
  if (!hasArgs) return null;

  return (
    <div className="rounded-md bg-white border border-blue-200 p-3">
      <div className="mb-2 text-xs font-semibold text-blue-700 uppercase tracking-wide">
        Proposed Action
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Action:</span>
          <span className="ml-2 text-sm text-gray-900 font-mono">
            {actionRequest.action}
          </span>
        </div>
        {Object.entries(actionRequest.args || {}).map(([key, value]) => (
          <div key={key}>
            <span className="text-sm font-medium text-gray-700">{key}:</span>
            <div className="ml-4 mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Example Display:**
```
Proposed Action
--------------
Action: send_email
to: stakeholder@company.com
subject: Climate Risk Assessment - Review Required
body: Dear stakeholder,

Please review the attached climate risk assessment...
```

### Action Buttons

**File:** `/home/user/tiler2-ui/src/features/thread/components/messages/chat-interrupt/components/action-buttons.tsx`

Provides user decision buttons:
```typescript
export const ActionButtons = ({
  config,
  onAccept,
  onEdit,
  onIgnore,
}: ActionButtonsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {config?.approve && onAccept && (
        <Button
          onClick={onAccept}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
      )}

      {config?.edit && onEdit && (
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}

      {config?.ignore && onIgnore && (
        <Button
          onClick={onIgnore}
          variant="ghost"
          size="sm"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )}
    </div>
  );
};
```

**Button Types:**
1. **Approve** - Accept the proposed action as-is
2. **Edit** - Modify the action parameters
3. **Cancel/Ignore** - Reject the action

## User Decision Handling

When a user clicks a button, the decision is sent to continue the workflow.

**Handler Implementation:**
```typescript
const handleActionClick = (action: string) => {
  stream.resumeThread({
    threadId: currentThreadId,
    action: action,
    args: {}, // Modified args if edited
  });
};
```

**Flow:**
1. User reviews interrupt
2. Clicks Approve/Edit/Cancel
3. Frontend sends resume request
4. Backend receives decision
5. Workflow continues from checkpoint
6. New messages stream to UI

### Approve Action

```typescript
const onAccept = () => {
  // Accept proposed action as-is
  handleActionClick("approve");
};

// Backend receives
{
  type: "response",
  action: "approve",
  args: {
    // Original args unchanged
    to: "stakeholder@company.com",
    subject: "Climate Report",
    body: "Please review..."
  }
}
```

### Edit Action

```typescript
const onEdit = () => {
  // Open edit dialog
  setEditDialogOpen(true);
};

const handleEditSubmit = (modifiedArgs: Record<string, unknown>) => {
  handleActionClick("approve", modifiedArgs);
  setEditDialogOpen(false);
};

// Backend receives
{
  type: "response",
  action: "approve",
  args: {
    // Modified args
    to: "stakeholder@company.com",
    subject: "Updated: Climate Report",  // User changed this
    body: "Dear Team,\n\nPlease review..."  // User changed this
  }
}
```

### Ignore/Cancel Action

```typescript
const onIgnore = () => {
  handleActionClick("ignore");
};

// Backend receives
{
  type: "response",
  action: "ignore",
  args: {}
}
```

## Resuming Workflows

After user decision, the workflow resumes from the interrupt checkpoint.

**Resume Request:**
```typescript
interface ResumeRequest {
  threadId: string;
  checkpoint?: string;  // Optional specific checkpoint
  input: {
    type: "response";
    action: "approve" | "ignore";
    args: Record<string, unknown>;
  };
}

// Example
await fetch(`${apiUrl}/runs/stream`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    thread_id: threadId,
    checkpoint: interrupt.checkpoint_id,
    input: {
      type: "response",
      action: "approve",
      args: modifiedArgs
    }
  })
});
```

**Backend Workflow:**
1. Receives resume request
2. Loads checkpoint state
3. Applies user decision
4. Continues workflow execution
5. Streams new messages

**State Transition:**
```
[Interrupted State]
status: "interrupted"
interrupts: { ... }

  ↓ User approves

[Running State]
status: "busy"
interrupts: {}

  ↓ Workflow completes

[Idle State]
status: "idle"
interrupts: {}
```

## Expert Help Requests

A special type of interrupt requests expert human assistance.

**Component:** `/home/user/tiler2-ui/src/features/thread/components/messages/shared/components/expert-help-dialog.tsx`

**Use Case:**
When the AI determines it lacks expertise to answer a question, it can request human expert intervention.

**Flow:**
1. AI encounters complex question
2. Creates expert help interrupt
3. Displays dialog to user
4. User can:
   - Provide more context
   - Connect to expert
   - Continue anyway
   - Cancel request

**Example:**
```typescript
{
  type: "expert_help",
  message: "This question requires specialized knowledge in TCFD disclosure frameworks. Would you like to connect with a sustainability expert?",
  data: {
    topic: "TCFD Climate Disclosure",
    complexity: "high",
    suggested_experts: ["financial_climate_expert", "tcfd_specialist"]
  },
  config: {
    continue: true,
    request_expert: true,
    cancel: true
  }
}
```

## Interrupt Helper Functions

**File:** `/home/user/tiler2-ui/src/features/thread/components/messages/chat-interrupt/utils/interrupt-helpers.ts`

### Get Question Text

```typescript
export const getQuestionText = (interrupt: InterruptData): string => {
  // Extract question/prompt from interrupt
  return interrupt.message ||
         interrupt.data?.question ||
         interrupt.action_request?.prompt ||
         "Please review the proposed action";
};
```

### Check for Action Args

```typescript
export const hasActionArgs = (
  actionRequest?: ActionRequest
): boolean => {
  if (!actionRequest?.args) return false;
  return Object.keys(actionRequest.args).length > 0;
};
```

### Format Args for Display

```typescript
export const formatArgValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return JSON.stringify(value, null, 2);
};
```

## Best Practices

### 1. Clear Interrupt Messages

```typescript
// ✅ Good - Specific, actionable
"I'm about to send an email to 15 stakeholders. Please review the content below."

// ❌ Bad - Vague, unclear
"Do you want to proceed?"
```

### 2. Show All Action Details

```typescript
// ✅ Good - Full transparency
<ActionDetails
  action="send_email"
  args={{
    to: "user@example.com",
    subject: "Climate Report",
    body: "Full email content here..."
  }}
/>

// ❌ Bad - Hidden details
<div>Send email to user@example.com</div>
```

### 3. Provide Undo/Cancel

```typescript
// ✅ Good - Always allow cancel
{config?.ignore && (
  <Button onClick={onIgnore}>Cancel</Button>
)}

// ❌ Bad - No way to cancel
// Only Approve button
```

### 4. Validate User Edits

```typescript
// ✅ Good - Validate edited args
const handleEditSubmit = (args: Record<string, unknown>) => {
  if (!args.to || !args.subject) {
    toast.error("Email requires recipient and subject");
    return;
  }
  resumeWithArgs(args);
};

// ❌ Bad - Accept any input
resumeWithArgs(args);
```

## Common Patterns

### Loading State During Resume

```typescript
const [isResuming, setIsResuming] = useState(false);

const handleAccept = async () => {
  setIsResuming(true);
  try {
    await resumeWorkflow("approve", args);
  } catch (error) {
    toast.error("Failed to resume workflow");
  } finally {
    setIsResuming(false);
  }
};
```

### Edit Dialog

```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [editedArgs, setEditedArgs] = useState(interrupt.action_request.args);

<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Action Parameters</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleEditSubmit}>
      {Object.entries(editedArgs).map(([key, value]) => (
        <FormField
          key={key}
          label={key}
          value={value}
          onChange={(newValue) =>
            setEditedArgs(prev => ({ ...prev, [key]: newValue }))
          }
        />
      ))}
      <DialogFooter>
        <Button type="submit">Save & Continue</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Interrupt Indicator

Show indicator when thread is interrupted:

```typescript
{thread.status === "interrupted" && (
  <div className="flex items-center gap-2 text-blue-600">
    <AlertCircle className="h-4 w-4" />
    <span className="text-sm">Waiting for your input</span>
  </div>
)}
```

## Generic Interrupts

For complex interrupts with arbitrary data structures.

**Component:** `/home/user/tiler2-ui/src/features/thread/components/messages/generic-interrupt.tsx`

**Features:**
- Displays interrupt data in table format
- Expandable for large payloads
- Handles nested objects
- Copy to clipboard

**Use Case:**
When interrupt data doesn't fit the chat interrupt pattern (e.g., large configuration objects, multi-step forms).

## Security Considerations

### 1. Validate Actions Server-Side

```typescript
// Server must validate user can perform action
if (!canUserPerformAction(userId, action)) {
  throw new Error("Unauthorized action");
}
```

### 2. Sanitize User Input

```typescript
// Sanitize edited args before sending
const sanitizedArgs = sanitizeObject(editedArgs);
```

### 3. Rate Limit Resume Requests

```typescript
// Prevent spam
if (recentResumeRequests.length > 5) {
  throw new Error("Too many resume requests");
}
```

## Troubleshooting

### Interrupt Not Showing

**Check:**
1. Thread status is "interrupted"
2. Interrupts object has data
3. Interrupt component properly rendered
4. No JavaScript errors

### Resume Not Working

**Check:**
1. Correct checkpoint ID
2. Valid action type
3. Args match expected schema
4. Network request succeeding

### Buttons Not Appearing

**Check:**
1. Config has correct flags (approve, edit, ignore)
2. Handlers passed to component
3. Conditional rendering logic

## Performance Considerations

### Debounce Edit Changes

```typescript
const debouncedUpdate = useDebounce(updateEditedArgs, 300);
```

### Memoize Interrupt Data

```typescript
const formattedArgs = useMemo(
  () => formatActionArgs(interrupt.action_request.args),
  [interrupt.action_request.args]
);
```

## Related Documentation

- [Chat System](/home/user/tiler2-ui/docs/08-chat-system.md) - Message rendering
- [Workflows](/home/user/tiler2-ui/docs/10-workflows.md) - Workflow context
- [Thread Management](/home/user/tiler2-ui/docs/09-thread-management.md) - Thread status
- [State Management](/home/user/tiler2-ui/docs/06-state-management.md) - Interrupt state

---

**Next:** [Artifacts](/home/user/tiler2-ui/docs/13-artifacts.md)
