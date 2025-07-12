import { StudentStatsCards, StudentTable } from '@/feature/student/components';
import { usePageTitle } from '@/hooks/usePageTitle';

export const StudentManagement = () => {
  usePageTitle('Quản lý học sinh');

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-4 h-full">
      <div className="min-h-0 space-y-4">
        <StudentTable />
      </div>
      <StudentStatsCards students={[]} />
    </div>
  );
};
