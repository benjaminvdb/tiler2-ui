import React from "react";

interface TokenErrorScreenProps {
  error: Error;
  onLoginRedirect: () => void;
}

/**
 * Component to display authentication error
 */
export const TokenErrorScreen: React.FC<TokenErrorScreenProps> = ({
  error,
  onLoginRedirect,
}) => (
  <div className="bg-background flex h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-destructive">
        Authentication error: {error.message}
      </p>
      <p className="text-muted-foreground text-sm">
        Your session may have expired. Please log in again.
      </p>
      <button
        type="button"
        onClick={onLoginRedirect}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm"
      >
        Log In
      </button>
    </div>
  </div>
);
