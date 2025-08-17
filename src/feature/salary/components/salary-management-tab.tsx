import { useEffect, useState } from 'react';

import TeacherSelect from '@/components/features/teacher-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalary, useTeacher } from '@/hooks';
import type { Teacher, TeacherMonthlySummary } from '@/types/api.types';
import { Users } from 'lucide-react';

import { SalaryOverviewCards } from './salary-overview-cards';
import { SalaryConfigCard } from './salary-config-card';
import { SalaryCalculationPanel } from './salary-calculation-panel';
import { SalarySummariesTable } from './salary-summaries-table';

export const SalaryManagementTab = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [salaryStats, setSalaryStats] = useState({
    totalTeachers: 0,
    calculatedThisMonth: 0,
    pendingCalculations: 0,
    averageSalary: 0,
    totalSalaryPaid: 0,
    completionRate: 0,
  });

  const {
    handleFetchTeacherSalaryConfig,
    handleFetchTeacherSalarySummaries,
    teacherConfigs,
    monthlySummaries,
    configLoading
  } = useSalary();

  const {
    handleFetchTeachers,
    teachers,
    handleFetchTeacher,
    loading: teacherLoading
  } = useTeacher();

  // Fetch teachers on component mount
  useEffect(() => {
    handleFetchTeachers();
  }, [handleFetchTeachers]);

  // Calculate salary statistics
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Filter summaries for current month
    const currentMonthSummaries = monthlySummaries.filter(
      summary => summary.month === currentMonth && summary.year === currentYear
    );

    // Calculate stats
    const totalTeachers = Object.keys(teacherConfigs).length;
    const calculatedThisMonth = currentMonthSummaries.length;
    const pendingCalculations = Math.max(0, totalTeachers - calculatedThisMonth);

    const totalSalary = currentMonthSummaries.reduce((sum, summary) => sum + summary.total_salary, 0);
    const averageSalary = calculatedThisMonth > 0 ? totalSalary / calculatedThisMonth : 0;

    const totalCompletionRate = currentMonthSummaries.reduce((sum, summary) => sum + summary.completion_rate, 0);
    const completionRate = calculatedThisMonth > 0 ? totalCompletionRate / calculatedThisMonth : 0;

    setSalaryStats({
      totalTeachers,
      calculatedThisMonth,
      pendingCalculations,
      averageSalary,
      totalSalaryPaid: totalSalary,
      completionRate,
    });
  }, [teacherConfigs, monthlySummaries]);

  const handleTeacherSelect = async (teacherId: string) => {
    if (!teacherId) {
      setSelectedTeacher(null);
      return;
    }

    try {
      // Fetch teacher details
      await handleFetchTeacher(parseInt(teacherId));

      // Find teacher from the list
      const teacher = teachers.find(t => t.id?.toString() === teacherId);
      if (teacher) {
        setSelectedTeacher(teacher);

        // Fetch salary configuration
        handleFetchTeacherSalaryConfig(teacher.id!);
      }
    } catch (error) {
      console.error('Error selecting teacher:', error);
    }
  };

  const handleConfigUpdate = () => {
    // Refresh teacher data and config after update
    if (selectedTeacher?.id) {
      handleFetchTeacher(selectedTeacher.id);
      handleFetchTeacherSalaryConfig(selectedTeacher.id);
    }
  };

  const handleCalculationComplete = (summary: TeacherMonthlySummary) => {
    // Refresh the summaries table
    if (selectedTeacher?.id) {
      handleFetchTeacherSalarySummaries(selectedTeacher.id, { page: 0, size: 12 });
    }
    console.log('Calculation completed:', summary);
  };

  // Transform teachers for select component
  // const teacherOptions = teachers.map(teacher => ({
  //   value: teacher.id?.toString() || '',
  //   label: `${teacher.account.name}`,
  //   description: teacher.account?.email || '',
  // }));

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <SalaryOverviewCards
        stats={salaryStats}
        isLoading={configLoading || teacherLoading}
      />

      {/* Teacher Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chọn giáo viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <TeacherSelect
              handleSelect={handleTeacherSelect}
              value={selectedTeacher?.id?.toString() || ''}
              placeholder="Tìm và chọn giáo viên..."
              className="w-full"
            />
            {selectedTeacher && (
              <div className="mt-2 text-sm text-muted-foreground">
                Đã chọn: {selectedTeacher.account.name}
                {selectedTeacher.account?.email && (
                  <span> • {selectedTeacher.account.email}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration and Calculation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Salary Configuration */}
        <SalaryConfigCard
          teacher={selectedTeacher}
          onConfigUpdate={handleConfigUpdate}
        />

        {/* Right: Salary Calculation */}
        <SalaryCalculationPanel
          teacher={selectedTeacher}
          onCalculationComplete={handleCalculationComplete}
        />
      </div>

      {/* Salary History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lịch sử tính lương</CardTitle>
        </CardHeader>
        <CardContent>
          <SalarySummariesTable
            teacher={selectedTeacher}
            showAllTeachers={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};