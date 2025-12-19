export const AssistantMessageLoading: React.FC = () => {
  return (
    <div className="mr-auto flex items-start gap-4">
      <div className="bg-sage flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
        <div className="border-almost-black h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
      <div className="border-border bg-card flex items-center gap-1.5 rounded-lg border px-6 py-4">
        <div
          className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
};
