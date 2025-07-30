import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/feature/auth/hooks/useAuth';
import { getAccount } from '@/feature/auth/services/authApi';
import { setAccount } from '@/feature/auth/slice/auth.slice';
import { usePageTitle } from '@/hooks/usePageTitle.tsx';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { BotIcon, HomeIcon } from 'lucide-react';

const AuthLayout = () => {
  const dispatch = useAppDispatch();
  const { account } = useAuth();
  const { accessToken } = useAppSelector((state) => state.auth);
  usePageTitle('Đăng nhập - Chemist');

  // Load account data if user is authenticated but account data is missing
  useEffect(() => {
    if (accessToken && !account) {
      const fetchUser = async () => {
        try {
          const response = await getAccount();
          const accountData = response.payload;
          dispatch(setAccount(accountData));
        } catch (error) {
          console.error('Failed to fetch user in AuthLayout:', error);
          // Don't redirect to login in AuthLayout as user is already on login page
        }
      };

      fetchUser();
    }
  }, [accessToken, account, dispatch]);

  return (
    <div className="flex min-h-svh flex-col">
      {/* Auth Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BotIcon className="size-6 text-primary" />
            <h1 className="text-lg font-semibold">Chemist</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {account ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Xin chào, {account.name} ({account.role_name})
                </span>
                <Button asChild variant="outline" size="sm">
                  <a href="/dashboard">
                    <HomeIcon className="mr-1 size-4" />
                    Về trang chủ
                  </a>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <a href="/ai-assistant">
                  <BotIcon className="mr-1 size-4" />
                  Trợ lý AI
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Hệ thống quản lý Chemist - Đăng nhập để truy cập đầy đủ tính năng
          </p>
          {!account && (
            <p className="mt-1">
              💡 <strong>Mẹo:</strong> Sau khi đăng nhập, bạn có thể sử dụng Trợ lý AI để hỗ trợ công việc
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;