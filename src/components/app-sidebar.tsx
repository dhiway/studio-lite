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
import { useOrgSettings } from "@/context/OrgSettingsContext";
import { Link, useLocation } from "@tanstack/react-router";

// This is sample data.
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen, registries } = useOrgSettings();
  const location = useLocation();

  // Memoize the data based on registries
  const data = React.useMemo(() => {
    const recentItems = (registries || []).map((registry: any) => {
      let schemaTitle = "Unknown Schema";
      try {
        const schemaObj = typeof registry.schema === 'string'
          ? JSON.parse(registry.schema)
          : registry.schema;
        if (schemaObj && schemaObj.title) schemaTitle = schemaObj.title;
      } catch (e) { console.error("Error parsing schema", e); }
      return { title: schemaTitle, url: `/recordCreate/${registry.id}`, image: menuSubImage };
    });

    const credentialItems = (registries || []).map((registry: any) => {
      let schemaTitle = "Unknown Schema";
      try {
        const schemaObj = typeof registry.schema === 'string'
          ? JSON.parse(registry.schema)
          : registry.schema;
        if (schemaObj && schemaObj.title) schemaTitle = schemaObj.title;
      } catch (e) { console.error("Error parsing schema", e); }
      return { title: schemaTitle, url: `/recordShow/${registry.id}`, image: menuSubImage };
    });

    return {
      navMain: [
        {
          title: "Choose Schema",
          image: chooseImage,
          url: "/dashboard",
          items: [],
          marginTop: "mt-[11px]",
        },
        {
          title: "Recently Used Schema",
          image: historyImage,
          url: "/recent/id-card",
          items: recentItems.length > 0 ? recentItems : [],
          marginTop: "mt-[11px]",
        },
        {
          title: "All Issued Credentials",
          image: menuImage,
          url: "/credentialShow",
          items: credentialItems.length > 0 ? credentialItems : [],
          marginTop: "mt-[87px]",
        }
      ],
    };
  }, [registries]);
  return (
    <Sidebar {...props} className="min-w-[335px]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild >
              <Link to="/">
                {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div> */}
                <div className="flex flex-col leading-none mt-3.5 mb-0">
                  <span className="font-regular text-[27px] ">MARK Lite</span>
                </div>
              </Link>
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

                >
                  <Link to={item.url} className={`font-regular text-[22px] w-full p-1.5 ${item.marginTop || "mt-[11px]"}`}>
                    <img src={item.image} alt="icon" />{item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                          <Link to={subItem.url} className="font-regular text-[19px]"> <img src={subItem.image} alt="icon" /><span className="text-[#898989]"> {subItem.title}</span></Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-row gap-0.5 leading-none ml-2 mb-8" onClick={() => setOpen(true)}>
          <img src={orgImage} alt="orgImage" /> <span className="font-regular text-[18px] pl-2"> Organisation Settings</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
