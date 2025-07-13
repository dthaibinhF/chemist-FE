import { StudentStatsCards, StudentTable } from '@/feature/student/components';
import { usePageTitle } from '@/hooks/usePageTitle';

export const StudentManagement = () => {
  usePageTitle('Quản lý học sinh');

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-4 overflow-hidden">
      <div className="space-y-4 min-w-0">
        <StudentTable />
      </div>
      <div className="min-w-0">
        <StudentStatsCards students={[]} />
      </div>
    </div>
  );
};
