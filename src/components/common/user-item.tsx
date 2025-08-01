import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useAppSelector } from '@/redux/hook.ts';
import { accountHelpers } from '@/utils/rbac-utils';

const UserItem = () => {
  const { account, isLoading } = useAppSelector((store) => store.auth);

  if (isLoading || !account) {
    return (
      <div className="flex flex-col justify-start border rounded-[24px] py-3 px-4">
        <Skeleton className="h-3 mb-2" />
        <Skeleton className="h-3 mb-2" />
      </div>
    );
  }

  const currentRole = accountHelpers.getCurrentRoleName(account);
  const displayRole = currentRole.startsWith('ROLE_') 
    ? currentRole.slice(5).toLowerCase() 
    : currentRole.toLowerCase();

  return (
    <div className="flex flex-col justify-start border rounded-[24px] py-3 px-4">
      <p className="font-bold text-sidebar-foreground">{account.name}</p>
      <p className="text-sidebar-foreground">{displayRole}</p>
    </div>
  );
};

export default UserItem;
