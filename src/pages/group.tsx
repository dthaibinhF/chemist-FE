import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GroupTable from '@/feature/group/components/group-table';
import { usePageTitle } from '@/hooks/usePageTitle';

const GroupManagement = () => {
  usePageTitle('Quản lý nhóm học');

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex items-center gap-4">
        {/* Add your filter components here */}
        {/* Example: Academic Year filter, Grade filter, Status filter */}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số nhóm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">+2 nhóm trong tháng này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhóm đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">80% tổng số nhóm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học sinh đang học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">Trung bình 10 học sinh/nhóm</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Table */}
      <div>
        <GroupTable />
      </div>
    </div>
  );
};

export default GroupManagement;
