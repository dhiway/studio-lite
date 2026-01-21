// src/layouts/Layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import WarningMessage from "@/components/ui/warningMessageCustom";
import React from "react";
import { OrgSettingsProvider } from "@/context/OrgSettingsContext";
import { Toaster } from "@/components/ui/sonner"


type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <OrgSettingsProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-hidden">
          {/* Sidebar (common for all pages) */}
          <AppSidebar />

          {/* Main content */}
          <SidebarInset className="flex-1 w-full">
            <div
              className="
                flex flex-col flex-1
                w-full h-full
                text-center
                justify-center
                align-center
                mx-auto
                bg-[#212121]
                [background-image:linear-gradient(to_right,#393939_1px,transparent_1px),
                linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)]
                bg-[size:30px_30px]
                sm:bg-[size:35px_35px]
                md:bg-[size:40px_40px]
                lg:bg-[size:50px_50px]
                overflow-x-hidden
              "
            >
              <div className="flex text-center justify-center align-center">
                <WarningMessage />
              </div>
              {children}
            </div>
            <Toaster />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrgSettingsProvider>
  );
}
