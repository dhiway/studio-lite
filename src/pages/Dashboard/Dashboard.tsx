import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import RightContent from "./RightContent"

export default function Dashboard() {
  const WarningMessage = () => {
    return (
      <div className="bg-[#523F1A] text-white p-2 max-w-[706px] text-center rounded-full absolute top-4 px-6 " role="alert">
        <p className="font-regular text-lg">
          You are using MARK Lite, <u  className='cursor-pointer' onClick={()=>open('https://studio.dhiway.com/')}>Upgrade to MARK Studio</u> for Template Designer
        </p>
      </div>
    )
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-0 p-0">
          <div className="min-h-screen bg-[#212121] [background-image:linear-gradient(to_right,#393939_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)] bg-[size:40px_40px] ">
            <div className="flex text-center justify-center align-center">
              <WarningMessage />
              </div>
            <RightContent />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    
  )
}
