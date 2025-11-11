import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import chooseImage from "@/assets/images/choose.png";
import historyImage from "@/assets/images/history.png";
import menuSubImage from "@/assets/images/menu_sub.png";
import menuImage from "@/assets/images/menu.png";
import orgImage from "@/assets/images/org.png";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Choose Schema",
      image: chooseImage,
      url: "/dashboard",
      items: [],
    },
    {
      title: "Recently Used Schema",
      image: historyImage,
      url: "/recent/id-card",
      items: [
         {
          title: "ID Card",
          url: "/recent/id-card",
          image: menuSubImage,
        },
         {
          title: "Grade Sheet",
           url: "/recent/grade-sheet",
           image: menuSubImage,
        },
          {
          title: "Course Certificate",
          url: "/recent/course-certificate",
          image: menuSubImage,
        },
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="min-w-[335px]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild >
              <a href="#">
                {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div> */}
                <div className="flex flex-col leading-none mt-3.5 mb-0">
                  <span className="font-regular text-[27px] ">MARK Lite</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-[45px]">
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild 
                  isActive={location.pathname === item.url}
                  onClick={() => navigate({ pathname: '/dashboard' })}
                >
                  <a href={item.url} className="font-regular text-[22px] w-full p-1.5 mt-[11px]">
                    <img src={item.image} alt="icon" />{item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        {console.log("location.pathname:", location.pathname, "item.url:", item.url)}
                        <SidebarMenuSubButton asChild isActive={location.pathname === item.url}>
                          <a href={item.url} className="font-regular text-[19px]"> <img src={item.image} alt="icon" /> {item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
            <SidebarMenuButton asChild isActive={location.pathname === '/credentialShow'
            }
                  onClick={() => navigate({ pathname: '/credentialShow' })}>
                  <a href={'/credentialShow'} className="font-regular text-[22px] w-full p-1.5 mt-[87px]">
                    <img src={menuImage} alt="icon" /> All Issued Credentials
                  </a>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
       <SidebarFooter>
        <div className="flex flex-row gap-0.5 leading-none ml-2 mb-8">
          <img src={orgImage} alt="orgImage"/> <span className="font-regular text-[18px] pl-2"> Organisation Settings</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
