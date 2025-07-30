import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { BarChart3, Users, DollarSign, GraduationCap } from "lucide-react";

const Dashboard = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const { dashboard, financial, student, admin } = useRolePermissions();

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboard.canViewStatistics && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng quan hệ thống</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,345</div>
              <p className="text-xs text-muted-foreground">Hoạt động hệ thống</p>
            </CardContent>
          </Card>
        )}

        {(student.canViewAllStudents || student.canViewOwnStudentData) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Học sinh</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                {student.canViewAllStudents ? "Tổng số học sinh" : "Học sinh của tôi"}
              </p>
            </CardContent>
          </Card>
        )}

        {(financial.canViewAllFinances || financial.canViewOwnPayments) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tài chính</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫123,456,789</div>
              <p className="text-xs text-muted-foreground">
                {financial.canViewAllFinances ? "Tổng doanh thu" : "Thanh toán của tôi"}
              </p>
            </CardContent>
          </Card>
        )}

        {admin.canManageUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quản trị</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">56</div>
              <p className="text-xs text-muted-foreground">Người dùng hệ thống</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lịch làm việc</CardTitle>
            <CardDescription>Chọn khoảng thời gian để xem lịch</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              month={date?.from ?? new Date()}
              numberOfMonths={1}
              selected={date}
              onSelect={setDate}
              className="rounded-lg border shadow-sm"
            />
          </CardContent>
        </Card>

        {dashboard.canViewStatistics && (
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Học sinh mới đăng ký</p>
                    <p className="text-sm text-muted-foreground">5 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Thanh toán được xử lý</p>
                    <p className="text-sm text-muted-foreground">10 phút trước</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Nhóm học mới tạo</p>
                    <p className="text-sm text-muted-foreground">15 phút trước</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;