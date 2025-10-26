export const AssistantMessageLoading: React.FC = () => {
  return (
    <div className="mr-auto flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-almost-black border-t-transparent" />
      </div>
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-6 py-4">
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
};
