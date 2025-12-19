import React, { useState, useCallback, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { AuthButtons } from "@/features/auth/components";
import { Navigation } from "@/core/components/navigation";
import { LinkLogoSVG } from "@/shared/components/icons/link";
import { AssistantThreadList } from "@/features/assistant-ui/thread-list";
import { useAssistantState } from "@assistant-ui/react";

export const MobileHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const activeThreadId = useAssistantState(
    ({ threadListItem }) => threadListItem.remoteId,
  );

  const handleMenuClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeThreadId) {
      // Closing the sheet when a thread is chosen keeps UX consistent on mobile.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }
  }, [isOpen, activeThreadId]);

  return (
    <div className="bg-background border-b lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Hamburger Menu Button (Top Left) */}
        <Sheet
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex max-h-screen w-80 flex-col"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center justify-start">
                {/* Brand Logo + Text (Always Visible) */}
                <div className="flex items-center gap-2">
                  <LinkLogoSVG
                    width={24}
                    height={24}
                  />
                  <span className="text-lg font-medium tracking-tight">
                    Link Chat
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>

            {/* Navigation Section */}
            <div className="mt-6">
              <Navigation
                isCollapsed={false}
                onNavigate={handleMenuClose}
              />
            </div>

            {/* Thread History Section */}
            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <div className="mb-4 px-2">
                <h2 className="text-sm font-normal tracking-tight">
                  Chat History
                </h2>
              </div>
              <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-accent dark:scrollbar-thumb-accent/30 dark:hover:scrollbar-thumb-accent/50 flex-1 overflow-y-auto overscroll-contain px-4">
                <AssistantThreadList />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile/Auth Button (Top Right) */}
        <AuthButtons />
      </div>
    </div>
  );
};
