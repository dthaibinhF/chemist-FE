import {Outlet, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useAppSelector} from "@/redux/hook.ts";
import {usePageTitle} from "@/hooks/usePageTitle.tsx";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import AppSideBar from "@/components/common/app-side-bar.tsx";
import {useAuth} from "@/feature/auth/hooks/useAuth.ts";
import SiteHeader from "@/components/common/site-header.tsx";

const HomeLayout = () => {
    usePageTitle('HomeLayout');
    const {fetchUser} = useAuth();
    const navigate = useNavigate();
    const {accessToken} = useAppSelector(state => state.auth);

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
        } else {
            fetchUser();
        }
    }, [accessToken, navigate]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center ">
            <SidebarProvider>
                <AppSideBar/>
                <SidebarInset>
                    <SiteHeader/>
                    <div>
                        <Outlet/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>)
}

export default HomeLayout;