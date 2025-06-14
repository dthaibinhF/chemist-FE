import {createBrowserRouter} from "react-router-dom";
import HomeLayout from "@/pages/layout/HomeLayout.tsx";
import {LoginPage} from "@/pages/login-page.tsx";
import {StudentManagement} from "@/pages/student-management.tsx";
import Dashboard from "@/pages/dashboard.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: HomeLayout,
        children: [
            {
                path: 'dashboard',
                Component: Dashboard,
            },
            {
                path:'student',
                Component: StudentManagement,
            }
        ]
    },
    {
        path:'/login',
        Component: LoginPage
    }
])