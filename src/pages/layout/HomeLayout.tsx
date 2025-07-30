import { Outlet } from 'react-router-dom';

import AppSideBar from '@/components/common/app-side-bar.tsx';
import SiteHeader from '@/components/common/site-header.tsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { usePageTitle } from '@/hooks/usePageTitle.tsx';
import { AuthProvider } from '@/components/auth';

const HomeLayout = () => {
  usePageTitle('HomeLayout');

  return (
    <AuthProvider>
      <div className="flex min-h-svh flex-col items-center justify-center no-scrollbar overflow-x-hidden">
        <SidebarProvider>
          <AppSideBar />
          <SidebarInset>
            <SiteHeader />
            <div className="p-4 no-scrollbar overflow-x-hidden">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthProvider>
  );
};

export default HomeLayout;
