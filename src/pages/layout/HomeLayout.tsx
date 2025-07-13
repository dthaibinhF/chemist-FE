import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import AppSideBar from '@/components/common/app-side-bar.tsx';
import SiteHeader from '@/components/common/site-header.tsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { getAccount } from '@/feature/auth/services/authApi.ts';
import { setAccount } from '@/feature/auth/slice/authSlice.ts';
import { usePageTitle } from '@/hooks/usePageTitle.tsx';
import { useAppDispatch, useAppSelector } from '@/redux/hook.ts';

const HomeLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);
  usePageTitle('HomeLayout');

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await getAccount();
        const account = response.payload;
        dispatch(setAccount(account));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [accessToken, dispatch, navigate]);

  return (
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
  );
};

export default HomeLayout;
