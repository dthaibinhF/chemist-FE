import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useEffect, useState } from "react";
import { EnhancedFinanceOverviewCards } from "@/components/common/enhanced-finance-overview-cards";
import { StudentStatsCards } from "@/feature/student/components/student-stats-cards";
import { WeeklyCalendar } from "@/feature/timetable/components/weekly-calendar";
import { useStudent } from "@/feature/student/hooks/useStudent";
import { useTimetable } from "@/feature/timetable/hooks/useTimetable";
import { convertScheduleToEvent } from "@/feature/timetable/utils/calendar-utils";

const Dashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const { financial, student } = useRolePermissions();
  const { students, loading: studentLoading, loadStudents } = useStudent();
  const { schedules, loading: scheduleLoading, handleFetchWeeklySchedules } = useTimetable();

  const calendarEvents = schedules.map(convertScheduleToEvent);

  useEffect(() => {
    if (student.canViewAllStudents || student.canViewOwnStudentData) {
      loadStudents();
    }
    
    // Calculate week start and end dates
    const startOfWeek = new Date(selectedWeek);
    startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    handleFetchWeeklySchedules(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }, [student.canViewAllStudents, student.canViewOwnStudentData, loadStudents, selectedWeek, handleFetchWeeklySchedules]);

  return (
    <div className="p-6 space-y-6">
      {/* Financial Overview Cards */}
      {(financial.canViewAllFinances || financial.canViewOwnPayments) && (
        <EnhancedFinanceOverviewCards />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(student.canViewAllStudents || student.canViewOwnStudentData) && (
          <div className="col-span-full">
            {studentLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Đang tải dữ liệu học sinh...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <StudentStatsCards students={students} />
            )}
          </div>
        )}
      </div>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch học tuần</CardTitle>
          <CardDescription>Lịch học và hoạt động giảng dạy trong tuần</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyCalendar
            events={calendarEvents}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            loading={scheduleLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;