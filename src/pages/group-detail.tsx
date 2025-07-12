import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroup } from '@/feature/group/hooks/useGroup';
import { StudentTable } from '@/feature/student/components';
import { AddStudentTab } from '@/feature/student/components/add-student-tab';
import { useFee } from '@/hooks/useFee';
import { Student } from '@/types/api.types';

export const GroupDetail = () => {
  const { id } = useParams();
  const { group, fetchGroup, loading } = useGroup();
  const { fee, handleFetchFee } = useFee();

  useEffect(() => {
    if (id) {
      fetchGroup(Number(id));
    }
  }, [id, fetchGroup]);

  useEffect(() => {
    if (group?.fee_id) {
      handleFetchFee(group.fee_id);
    }
  }, [group?.fee_id, handleFetchFee]);

  // Show loading state while data is being fetched
  if (loading || !group) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin nhóm...</p>
        </div>
      </div>
    );
  }

  const groupStudents: Student[] = group.student_details?.map((student) => {
    return {
      ...student,
      name: student.student_name,
      id: student.student_id,
      student_details: group.student_details,
    }
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
          <div className='flex items-center gap-2'>
            <p className="text-muted-foreground">Chi tiết nhóm học</p>
            <Badge variant='outline'>{group.level}</Badge>
          </div>
        </div>
        <AddStudentTab groupId={group.id} gradeId={group.grade_id} />

      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian học</CardTitle>
          </CardHeader>
          <CardContent>
            {group.group_schedules?.map((schedule) => {
              return (
                <div key={schedule.id} className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{schedule.day_of_week}</span>
                  <span className='text-sm text-muted-foreground'>{schedule.start_time.toString()} - {schedule.end_time.toString()}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học phí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fee?.amount.toLocaleString('vi-VN')} VNĐ</div>
            <p className="text-xs text-muted-foreground">{fee?.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStudents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Năm học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.academic_year}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Danh sách học sinh</TabsTrigger>
          <TabsTrigger value="schedule">Lịch học</TabsTrigger>
          <TabsTrigger value="attendance">Điểm danh</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <StudentTable students={groupStudents} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">{/* Schedule content */}</TabsContent>
        <TabsContent value="attendance">{/* Attendance content */}</TabsContent>
      </Tabs>
    </div >
  );
};
