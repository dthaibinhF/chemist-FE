import {createBrowserRouter} from "react-router-dom";
import HomeLayout from "@/pages/layout/HomeLayout.tsx";
import {LoginPage} from "@/pages/login-page.tsx";
import {StudentManagement} from "@/pages/student-management.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: HomeLayout,
        children: [
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