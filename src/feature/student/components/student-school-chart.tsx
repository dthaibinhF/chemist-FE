import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '@/types/api.types';

interface StudentSchoolChartProps {
  students: Student[];
}

export const StudentSchoolChart = memo(({ students }: StudentSchoolChartProps) => {
  const schoolData = useMemo(() => {
    const schoolCounts = students.reduce((acc, student) => {
      const schoolName = student.student_details?.[0]?.school?.name || 'Không xác định';
      acc[schoolName] = (acc[schoolName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(schoolCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  if (schoolData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bố theo trường</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Chưa có dữ liệu học sinh
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố theo trường</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={schoolData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [value, 'Số học sinh']}
              labelFormatter={(label) => `Trường: ${label}`}
            />
            <Bar dataKey="count" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

StudentSchoolChart.displayName = 'StudentSchoolChart';