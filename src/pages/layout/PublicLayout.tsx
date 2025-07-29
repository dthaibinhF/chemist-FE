import { Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/feature/auth/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle.tsx';
import { BotIcon, HomeIcon, LogInIcon } from 'lucide-react';

const PublicLayout = () => {
  const { account } = useAuth();
  usePageTitle('AI Assistant - Chemist');

  return (
    <div className="flex min-h-svh flex-col">
      {/* Public Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BotIcon className="size-6 text-primary" />
            <h1 className="text-lg font-semibold">Chemist AI Assistant</h1>
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
                <a href="/login">
                  <LogInIcon className="mr-1 size-4" />
                  Đăng nhập
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Trợ lý AI Chemist - Hỗ trợ thông tin học tập và quản lý trung tâm
          </p>
          {!account && (
            <p className="mt-1">
              💡 <strong>Mẹo:</strong> Đăng nhập để truy cập đầy đủ thông tin cá nhân và dữ liệu chi tiết
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;