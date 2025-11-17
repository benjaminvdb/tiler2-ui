import React from "react";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "./app-providers";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/features/side-panel/components/sidebar";
import { MobileHeader } from "@/features/side-panel/components/mobile-header";

interface AppLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Internal layout content component with sidebar and main content area.
 * Manages responsive sidebar behavior (collapsible on mobile, default open on desktop).
 * @param children - Main page content to display in the sidebar inset area
 * @returns Layout with sidebar and content area
 */
const AppLayoutContent = ({
  children,
}: AppLayoutContentProps): React.ReactNode => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout wrapper.
 * Provides error boundary protection, suspense fallback, and feature-specific context/hooks (Thread, Stream, Chat, etc).
 * @param children - Page content to render within the layout
 * @returns Full layout with providers and sidebar structure
 */
export const AppLayout = ({ children }: AppLayoutProps): React.ReactNode => {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen />}>
        <AppProviders>
          <AppLayoutContent>{children}</AppLayoutContent>
        </AppProviders>
      </React.Suspense>
    </ErrorBoundary>
  );
}
