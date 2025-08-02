import { StudentSchoolChart, StudentStatsCards, StudentTable } from '@/feature/student/components';
import { useStudent } from '@/feature/student/hooks/useStudent';
import { usePageTitle } from '@/hooks/usePageTitle';

export const StudentManagement = () => {
  usePageTitle('Quản lý học sinh');
  const { students } = useStudent();

  return (

    <div className="grid grid-cols-[2fr_1fr] gap-4 overflow-hidden">
      <div className="space-y-4 min-w-0">
        <StudentTable />
      </div>
      <div className="space-y-4 min-w-0">
        <StudentSchoolChart students={students} />
        <StudentStatsCards students={students} />
      </div>
    </div>
  );
};
