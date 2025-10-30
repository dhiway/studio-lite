import { createRootRoute, Outlet } from "@tanstack/react-router";
// import Header from "@/components/header/Header";
// import { Toaster } from "@/components/ui/toaster";

export const Route = createRootRoute({
    component: () => (
        <>
            {/* <Header /> */}
            <main>
                <Outlet />
                {/* <Toaster /> */}
            </main>
        </>
    ),
});