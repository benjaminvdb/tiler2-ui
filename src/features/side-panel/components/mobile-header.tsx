import React, { useState } from "react";
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
import { ThreadList } from "./thread-history/components/thread-list";
import { ThreadHistoryLoading } from "./thread-history/components/thread-history-loading";
import { useThreadHistory } from "./thread-history/hooks/use-thread-history";

export const MobileHeader: React.FC = () => {
  const { threads, threadsLoading } = useThreadHistory();
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="border-b bg-white lg:hidden">
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
                  <span className="text-lg font-semibold tracking-tight">
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
                <h2 className="text-sm font-medium tracking-tight">
                  Chat History
                </h2>
              </div>
              <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto overscroll-contain px-4">
                {threadsLoading ? (
                  <ThreadHistoryLoading />
                ) : (
                  <ThreadList
                    threads={threads}
                    onThreadClick={() => setIsOpen(false)}
                  />
                )}
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
