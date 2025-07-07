import LoginForm from '@/components/common/login-form';
import { usePageTitle } from '@/hooks/usePageTitle.tsx';

export const LoginPage = () => {
  usePageTitle('Login');

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <LoginForm />
    </div>
  );
};
