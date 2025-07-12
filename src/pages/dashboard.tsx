import { usePageTitle } from '@/hooks/usePageTitle';

const Dashboard = () => {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-4">
      Dashboard
    </div>
  );
};

export default Dashboard;
