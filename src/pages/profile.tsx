import {
  IdCard,
  Mail,
  Shield,
  User,
  UserCheck,
  Settings
} from 'lucide-react';
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/feature/auth/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const Profile = () => {
  usePageTitle('Profile');
  const { account } = useAuth();
  const { userRole, isAdmin, isManager, isTeacher, isStudent, isParent } = useRolePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: account?.name || '',
    email: account?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement actual save functionality
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: account?.name || '',
      email: account?.email || '',
    });
    setIsEditing(false);
  };

  const getRoleBadgeVariant = () => {
    if (isAdmin) return "default";
    if (isManager) return "secondary";
    if (isTeacher) return "outline";
    return "secondary";
  };

  const getRoleDescription = () => {
    if (isAdmin) return "Quản trị viên hệ thống";
    if (isManager) return "Quản lý trung tâm";
    if (isTeacher) return "Giáo viên";
    if (isStudent) return "Học sinh";
    if (isParent) return "Phụ huynh";
    return "Người dùng";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{account?.name || 'Người dùng'}</h1>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {account?.email || 'Chưa cập nhật email'}
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vai trò:</span>
                  <Badge variant={getRoleBadgeVariant()}>
                    {userRole || 'Không xác định'}
                  </Badge>
                </div>

                {/* Account Status */}
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Trạng thái:</span>
                  <Badge variant="default" className="text-accent">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Tên đầy đủ</label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên của bạn"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {account?.name || 'Chưa cập nhật'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email của bạn"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p>
                          {account?.email || 'Chưa cập nhật'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Vai trò</label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {getRoleDescription()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">ID tài khoản</label>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {account?.id || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-6 mt-6 border-t">
                  <Button onClick={handleSave} className="flex-1">
                    Lưu thay đổi
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    Hủy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Loại tài khoản</span>
                  <span className="font-semibold">{userRole}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trạng thái</span>
                  <Badge variant="default" className="text-xs">
                    Hoạt động
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quyền truy cập</span>
                  <span className="font-semibold text-xs">
                    {isAdmin ? 'Toàn quyền' : isManager ? 'Quản lý' : 'Hạn chế'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Xác thực 2FA</span>
                  <Badge variant="outline" className="text-xs">
                    Chưa kích hoạt
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phiên đăng nhập</span>
                  <Badge variant="default" className="text-xs">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;