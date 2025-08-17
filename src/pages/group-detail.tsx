import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupDialogEdit from '@/feature/group/components/group-dialog-edit';
import { GroupScheduleTab } from '@/feature/group/components/group-schedule-tab';
import { StudentTable } from '@/feature/student/components';
import { AddStudentTab } from '@/feature/student/components/add-student-tab';
import { useStudent } from '@/feature/student/hooks';
import { useFee } from '@/hooks/useFee';
import { useGroup } from '@/hooks/useGroup';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { displayDayEnum, displayTimeRange } from '@/utils/date-formatters';
import { PERMISSIONS } from '@/utils/rbac-utils';

export const GroupDetail = () => {
  const { id } = useParams();
  const { group, loading, handleFetchGroup } = useGroup();
  const { fee, handleFetchFee } = useFee();
  const { fetchStudentsByGroupId, students } = useStudent();

  useEffect(() => {
    if (id) {
      handleFetchGroup(Number(id));
    }
  }, [id, handleFetchGroup]);

  useEffect(() => {
    if (group?.fee_id) {
      handleFetchFee(group.fee_id);
    }
  }, [group?.fee_id, handleFetchFee]);

  // Re-fetch group data when student state changes (indicating new students were added)
  useEffect(() => {
    if (id) {
      fetchStudentsByGroupId(Number(id));
    }
  }, [id, fetchStudentsByGroupId]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Chi tiết nhóm học</p>
            <Badge variant="outline">{group.level}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleBasedAccess allowedRoles={PERMISSIONS.MANAGE_GROUPS}>
            <GroupDialogEdit group={group} />
          </RoleBasedAccess>
          <RoleBasedAccess allowedRoles={PERMISSIONS.MANAGE_GROUPS}>
            <AddStudentTab groupId={group.id} gradeId={group.grade_id} />
          </RoleBasedAccess>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian học</CardTitle>
          </CardHeader>
          <CardContent>
            {group.group_schedules?.map((schedule) => {
              return (
                <div key={schedule.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {displayDayEnum(schedule.day_of_week)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {`${schedule.start_time.slice(0, 5)} - ${schedule.end_time.slice(0, 5)}`}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học phí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fee?.amount ? formatCurrencyVND(fee.amount) : '0 VNĐ'}
            </div>
            <p className="text-xs text-muted-foreground">{fee?.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
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
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <StudentTable students={students} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <GroupScheduleTab groupId={group.id || 0} groupName={group.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
