import {Outlet, useNavigate} from "react-router-dom";
import {useLayoutEffect} from "react";
import {useAppDispatch, useAppSelector} from "@/redux/hook.ts";
import {usePageTitle} from "@/hooks/usePageTitle.tsx";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import AppSideBar from "@/components/common/app-side-bar.tsx";
import SiteHeader from "@/components/common/site-header.tsx";
import {getAccount} from "@/feature/auth/services/authApi.ts";
import {setAccount} from "@/feature/auth/slice/authSlice.ts";

const HomeLayout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {accessToken} = useAppSelector(state => state.auth);
    usePageTitle('HomeLayout');

    useLayoutEffect(() => {
        const fetchUser = async () => {
            try {
                console.log("Fetching user");
                const response = await getAccount();
                console.log(response);
                const account = response.payload;
                dispatch(setAccount(account));
                // return response;
            } catch (error) {
                console.log(error);
            }
        }
        return () => {
            if (!accessToken) {
                navigate("/login");
            } else {
                fetchUser();
            }
        }
    }, [accessToken, dispatch, navigate]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center ">
            <SidebarProvider>
                <AppSideBar/>
                <SidebarInset>
                    <SiteHeader/>
                    <div className="p-4">
                        <Outlet/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>)
}

export default HomeLayout;