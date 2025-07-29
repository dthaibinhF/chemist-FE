import { createBrowserRouter } from "react-router-dom";

import AiAssistantPage from "@/pages/ai-assistant";
import Dashboard from "@/pages/dashboard.tsx";
import { ErrorPage } from "@/pages/error-page";
import { FeeDetail } from "@/pages/fee-detail.tsx";
import FeeManagement from "@/pages/fee.tsx";
import FinanceManagement from "@/pages/finance.tsx";
import { GroupDetail } from "@/pages/group-detail";
import GroupManagement from "@/pages/group.tsx";
import HomeLayout from "@/pages/layout/HomeLayout.tsx";
import PublicLayout from "@/pages/layout/PublicLayout.tsx";
import { LoginPage } from "@/pages/login-page.tsx";
import { StudentDetailPage } from "@/pages/student-detail.tsx";
import { StudentManagement } from "@/pages/student-management.tsx";
import TimeTable from "@/pages/TimeTable";

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
        Component: StudentManagement,
        errorElement: <ErrorPage />,
      },
      {
        path: "student/:id",
        Component: StudentDetailPage,
        // errorElement: <ErrorPage />,
      },
      {
        path: "finance",
        Component: FinanceManagement,
      },
      {
        path: "group",
        Component: GroupManagement,
      },
      {
        path: "fee",
        Component: FeeManagement,
      },
      {
        path: "fee/:id",
        Component: FeeDetail,
      },
      {
        path: "group/:id",
        Component: GroupDetail,
      },
      {
        path: "time-table",
        Component: TimeTable,
      },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
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
]);
