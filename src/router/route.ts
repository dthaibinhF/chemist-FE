import {createBrowserRouter} from "react-router-dom";
import HomeLayout from "@/pages/layout/HomeLayout.tsx";
import {LoginPage} from "@/pages/login-page.tsx";
import {StudentManagement} from "@/pages/student-management.tsx";
import Dashboard from "@/pages/dashboard.tsx";
import FinanceManagement from "@/pages/finance.tsx";
import GroupManagement from "@/pages/group.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: HomeLayout,
        children: [
            {
                index: true,
                path: 'dashboard',
                Component: Dashboard,
            },
            {
                path:'student',
                Component: StudentManagement,
            },
            {
                path:'finance',
                Component: FinanceManagement,
            },
            {
                path:'group',
                Component: GroupManagement,
            }
        ]
    },
    {
        path:'/login',
        Component: LoginPage
    }
])