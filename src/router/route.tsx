import { createBrowserRouter } from "react-router-dom";

import AiAssistantPage from "@/pages/ai-assistant";
import Dashboard from "@/pages/dashboard.tsx";
import { ErrorPage } from "@/pages/error-page";
import { FeeDetail } from "@/pages/fee-detail.tsx";
import FeeManagement from "@/pages/fee.tsx";
import FinanceManagement from "@/pages/finance.tsx";
import { GroupDetail } from "@/pages/group-detail";
import GroupManagement from "@/pages/group.tsx";
import AuthLayout from "@/pages/layout/AuthLayout.tsx";
import HomeLayout from "@/pages/layout/HomeLayout.tsx";
import PublicLayout from "@/pages/layout/PublicLayout.tsx";
import { LoginPage } from "@/pages/login-page.tsx";
import Profile from "@/pages/profile.tsx";
import { StudentDetailPage } from "@/pages/student-detail.tsx";
import { StudentManagement } from "@/pages/student-management.tsx";
import TimeTable from "@/pages/TimeTable";
import UnauthorizedPage from "@/pages/unauthorized";
import UserManagement from "@/pages/admin/user-management";
import { RoleBasedAccess } from "@/components/auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      {
        index: true,
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "student",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
          <StudentManagement />
        </RoleBasedAccess>,
        errorElement: <ErrorPage />,
      },
      {
        path: "student/:id",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
          <StudentDetailPage />
        </RoleBasedAccess>,
        // errorElement: <ErrorPage />,
      },
      {
        path: "finance",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER']}>
          <FinanceManagement />
        </RoleBasedAccess>,
      },
      {
        path: "group",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
          <GroupManagement />
        </RoleBasedAccess>,
      },
      {
        path: "fee",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
          <FeeManagement />
        </RoleBasedAccess>,
      },
      {
        path: "fee/:id",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER']}>
          <FeeDetail />
        </RoleBasedAccess>,
      },
      {
        path: "group/:id",
        element: <RoleBasedAccess allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
          <GroupDetail />
        </RoleBasedAccess>,
      },
      {
        path: "time-table",
        Component: TimeTable,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "admin/users",
        element: <RoleBasedAccess allowedRoles={['ADMIN']}>
          <UserManagement />
        </RoleBasedAccess>,
      },
    ],
  },
  {
    path: "/login",
    Component: AuthLayout,
    children: [
      {
        index: true,
        Component: LoginPage,
      },
    ],
  },
  {
    path: "/ai-assistant",
    Component: PublicLayout,
    children: [
      {
        index: true,
        Component: AiAssistantPage,
      },
    ],
  },
  {
    path: "/unauthorized",
    Component: UnauthorizedPage,
  },
]);
