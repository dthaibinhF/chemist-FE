import {Outlet, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useAppSelector} from "@/redux/hook.ts";
import {usePageTitle} from "@/hooks/usePageTitle.tsx";

const HomeLayout = () => {
    usePageTitle('Login');
    const navigate = useNavigate();
    const {accessToken} = useAppSelector(state => state.auth);

    useEffect(() => {
        console.log('access token at Home Layout: ', accessToken);
        if (!accessToken) {
            navigate("/login");
        }
    }, [accessToken, navigate]);

    return <div>
        Home Layout
        <Outlet/>
    </div>
}

export default HomeLayout;