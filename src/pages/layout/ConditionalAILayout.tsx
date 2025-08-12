import { useAuth } from '@/feature/auth/hooks/useAuth';
import { useAppSelector } from '@/redux/hook';
import { AuthProvider } from '@/components/auth';
import HomeLayout from './HomeLayout';
import PublicLayout from './PublicLayout';

/**
 * ConditionalAILayout - Conditionally renders layout based on authentication state
 * - Authenticated users: HomeLayout (already wraps with AuthProvider)
 * - Unauthenticated users: Wrap with AuthProvider to initialize on reload and render PublicLayout
 */
const ConditionalAILayout = () => {
  const { isAuthenticated } = useAuth();
  const { isInitializing } = useAppSelector((state) => state.auth);

  // If already authenticated, use HomeLayout (it includes its own AuthProvider)
  if (isAuthenticated) {
    return <HomeLayout />;
  }

  // For unauthenticated users, ensure AuthProvider is mounted so initialization runs
  return (
    <AuthProvider>
      {isInitializing ? (
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      ) : (
        <PublicLayout />
      )}
    </AuthProvider>
  );
};

export default ConditionalAILayout;
