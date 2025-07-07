import { Building2, Users } from 'lucide-react';
import { memo, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '@/types/student.type';

interface StudentStatsCardsProps {
  students: Student[];
}

export const StudentStatsCards = memo(({ students }: StudentStatsCardsProps) => {
  // Memoize calculations để tránh tính toán lại không cần thiết
  const stats = useMemo(() => {
    const studentCount = students.length;

    // Lấy danh sách các trường (school) hiện tại có học sinh đang học
    const schools = students.reduce((schoolSet, student) => {
      if (student.studentDetails?.[0]?.school?.name) {
        schoolSet.add(student.studentDetails[0].school.name);
      }
      return schoolSet;
    }, new Set<string>());

    const schoolsList = Array.from(schools);

    // Tính số lượng nhóm học
    const groups = students.reduce((groupSet, student) => {
      if (student.studentDetails?.[0]?.group_name) {
        groupSet.add(student.studentDetails[0].group_name);
      }
      return groupSet;
    }, new Set<string>());

    const groupCount = groups.size;

    return {
      studentCount,
      schoolsList,
      groupCount,
    };
  }, [students]);

  return (
    <div className="grid grid-rows-3 md:grid-rows-1 gap-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.studentCount}</div>
          <p className="text-xs text-muted-foreground">Học sinh đang theo học</p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số nhóm học</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.groupCount}</div>
          <p className="text-xs text-muted-foreground">Nhóm học hiện tại</p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Các trường</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.schoolsList.length}</div>
          <p className="text-xs text-muted-foreground">Trường có học sinh</p>
          {stats.schoolsList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stats.schoolsList.slice(0, 3).map((school, idx) => (
                <span
                  key={school + idx}
                  className="bg-primary/10 text-accent-foreground dark:text-primary-foreground rounded px-2 py-1 text-xs"
                >
                  {school}
                </span>
              ))}
              {stats.schoolsList.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{stats.schoolsList.length - 3} khác
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

StudentStatsCards.displayName = 'StudentStatsCards';
