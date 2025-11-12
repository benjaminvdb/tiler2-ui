import React from "react";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "./app-providers";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { NewSidebar } from "@/features/side-panel/components/new-sidebar";
import { MobileHeader } from "@/features/side-panel/components/mobile-header";

interface AppLayoutContentProps {
  children: React.ReactNode;
}

function AppLayoutContent({
  children,
}: AppLayoutContentProps): React.ReactNode {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <NewSidebar />
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

export function AppLayout({ children }: AppLayoutProps): React.ReactNode {
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
