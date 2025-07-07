import { createBrowserRouter } from 'react-router-dom';

import Dashboard from '@/pages/dashboard.tsx';
import { ErrorPage } from '@/pages/error-page';
import FinanceManagement from '@/pages/finance.tsx';
import GroupManagement from '@/pages/group.tsx';
import { GroupDetail } from '@/pages/group-detail';
import HomeLayout from '@/pages/layout/HomeLayout.tsx';
import { LoginPage } from '@/pages/login-page.tsx';
import { StudentDetail } from '@/pages/student-detail.tsx';
import { StudentManagement } from '@/pages/student-management.tsx';

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
        path: 'student',
        Component: StudentManagement,
        errorElement: <ErrorPage />,
      },
      {
        path: 'student/:id',
        Component: StudentDetail,
        // errorElement: <ErrorPage />,
      },
      {
        path: 'finance',
        Component: FinanceManagement,
      },
      {
        path: 'group',
        Component: GroupManagement,
      },
      {
        path: 'group/:id',
        Component: GroupDetail,
      },
    ],
  },
  {
    path: '/login',
    Component: LoginPage,
  },
]);
