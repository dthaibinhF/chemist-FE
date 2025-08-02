import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GroupTable from '@/feature/group/components/group-table';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useGrade } from '@/hooks/useGrade';
import { usePageTitle } from '@/hooks/usePageTitle';

const GroupManagement = () => {
  usePageTitle('Quản lý nhóm học');
  const { academicYears, handleFetchAcademicYears } = useAcademicYear();
  const { grades, handleFetchGrades } = useGrade();

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  useEffect(() => {
    handleFetchAcademicYears();
    handleFetchGrades();
  }, [handleFetchAcademicYears, handleFetchGrades]);

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex items-center gap-4">
        {/* Add your filter components here */}
        {/* Example: Academic Year filter, Grade filter, Status filter */}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Năm học" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year.id} value={String(year.id)}>
                {year.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Khối" />
          </SelectTrigger>
          <SelectContent>
            {grades.map((grade) => (
              <SelectItem key={grade.id} value={String(grade.id)}>
                {grade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Group Table */}
      <div>
        <GroupTable academicYearId={selectedAcademicYear} gradeId={selectedGrade} />
      </div>
    </div>
  );
};

export default GroupManagement;
