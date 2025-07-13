import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  Loader2,
  Phone,
  User,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useRevalidator } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StudentPayment } from '@/feature/payment/components/student-payment';
import { EditStudentDialog } from '@/feature/student/components';
import { useStudent } from '@/feature/student/hooks/useStudent';
import type { StudentFormData } from '@/feature/student/schemas/student.schema';
import { useFee } from '@/hooks/useFee';
import { useGroup } from '@/hooks/useGroup';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Student, StudentDetail } from '@/types/api.types';

export const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [openEdit, setOpenEdit] = useState(false);
  const { loadStudent, selectedStudent, loading: studentLoading, editStudent } = useStudent();
  const { group, loading: groupLoading, handleFetchGroup } = useGroup();
  const { fee, loading: feeLoading, handleFetchFee } = useFee();

  // Đặt tiêu đề trang
  usePageTitle(`Chi tiết học sinh - ${selectedStudent?.name || 'Không xác định'}`);

  const getCurrentStudentDetail = (studentDetails: StudentDetail[]) => {
    return studentDetails.filter((detail) => detail.end_at === null || (detail?.end_at && detail?.end_at > new Date()))[0];
  }

  // Load student data first
  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      loadStudent(Number(id));
    }
  }, [id, loadStudent]);

  const currentStudentDetail = selectedStudent?.student_details ? getCurrentStudentDetail(selectedStudent.student_details) : undefined;
  const groupId = currentStudentDetail?.group_id;
  const feeId = group?.fee_id;

  // Load group data after student is loaded
  useEffect(() => {
    if (groupId) {
      handleFetchGroup(groupId);
    }
  }, [groupId]);

  // Load fee data after group is loaded
  useEffect(() => {
    if (feeId) {
      handleFetchFee(feeId);
    }
  }, [feeId]);
  // Hàm xử lý cập nhật học sinh
  const handleEditStudent = async (id: number, formData: StudentFormData) => {
    try {
      // Gọi API cập nhật học sinh
      await editStudent(id, formData as unknown as Student);

      // Hiển thị thông báo thành công
      toast.success('Cập nhật thông tin học sinh thành công!');

      // Đóng dialog
      setOpenEdit(false);
      revalidator.revalidate();
      // Reload lại thông tin học sinh để cập nhật UI
      if (id && !isNaN(Number(id))) {
        loadStudent(Number(id));
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Cập nhật thông tin học sinh thất bại!');
    }
  };

  const studentPaymentStatus = () => {
    const studentPayment = selectedStudent?.payment_details?.filter((payment) => payment.fee_id === fee?.id);
    const totalPayment = studentPayment?.reduce((acc, payment) => acc + payment.amount, 0);
    return totalPayment;
  }
  const loading = studentLoading || groupLoading || feeLoading;

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Không tìm thấy học sinh</h3>
          <p className="text-muted-foreground">Học sinh này không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => navigate('/students')} className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với thông tin cơ bản */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Thông tin học sinh */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{selectedStudent.name}</h1>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {selectedStudent.parent_phone || 'Chưa cập nhật'} (phụ huynh)
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => setOpenEdit(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Nhóm hiện tại */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Nhóm:</span>
                  <Badge variant="outline">
                    {currentStudentDetail?.group_name || 'Chưa phân nhóm'}
                  </Badge>
                </div>

                {/* Trạng thái học tập */}
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Trạng thái:</span>
                  {!currentStudentDetail ? (
                    <Badge variant="destructive">Đã nghỉ học</Badge>
                  ) : (
                    <Badge className="text-accent" variant="default">
                      Đang học
                    </Badge>
                  )}
                </div>

                {/* Tình trạng thanh toán */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Thanh toán:</span>
                  {
                    studentPaymentStatus() === fee?.amount ? (
                      <Badge variant="default">Đã thanh toán</Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive">Chưa thanh toán</Badge>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog chỉnh sửa */}
      <EditStudentDialog
        student={selectedStudent}
        onEditStudent={handleEditStudent}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      <Separator />

      {/* Phần nội dung chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin học tập (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin học tập chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Thông tin học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nhóm học</label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">
                        {selectedStudent.student_details?.[0]?.group_name || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Trường</label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {selectedStudent.student_details?.[0]?.school?.name || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Lớp</label>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {selectedStudent.student_details?.[0]?.school_class?.name ||
                          'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Khối</label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {selectedStudent.student_details?.[0]?.grade?.name || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Năm học</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {selectedStudent.student_details?.[0]?.academic_year?.year ||
                          'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  {selectedStudent.student_details?.[0] &&
                    typeof (selectedStudent.student_details?.[0] as any).enrollmentDate ===
                    'string' &&
                    (selectedStudent.student_details?.[0] as any).enrollmentDate ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Ngày nhập học
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p>
                          {new Date(
                            String((selectedStudent.student_details?.[0] as any).enrollmentDate)
                          ).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Student Status */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Số buổi học</span>
                  <span className="font-semibold">12/20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Điểm trung bình</span>
                  <span className="font-semibold">8.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tỷ lệ tham gia</span>
                  <span className="font-semibold">85%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {'create_at' in selectedStudent && typeof selectedStudent.create_at === 'string' ? (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Ngày tạo: </span>
                    <span className="text-sm">
                      {selectedStudent.create_at
                        ? new Date(String(selectedStudent.create_at)).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                ) : null}
                {'update_at' in selectedStudent && typeof selectedStudent.update_at === 'string' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Cập nhật lần cuối
                    </label>
                    <p className="text-sm">
                      {selectedStudent.update_at
                        ? new Date(String(selectedStudent.update_at)).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Payment History */}
      <StudentPayment studentId={Number(id)} />
    </div>
  );
};
