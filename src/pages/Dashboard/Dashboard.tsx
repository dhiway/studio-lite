import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-0 p-0">
          <div className="min-h-screen bg-[#212121] [background-image:linear-gradient(to_right,#393939_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
