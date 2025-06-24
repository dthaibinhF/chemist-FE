import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    ArrowLeft, 
    User, 
    Phone, 
    GraduationCap, 
    Building2, 
    Users, 
    Calendar,
    BookOpen,
    MapPin,
    Mail,
    Clock,
    Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { EditStudentDialog } from "@/feature/student/components";
import { useStudent } from "@/feature/student/hooks/useStudent";

export const StudentDetail = () => {
    const {loadStudent, selectedStudent, loading} = useStudent();
    const {id} = useParams();
    const navigate = useNavigate();
    const [openEdit, setOpenEdit] = useState(false);

    useEffect(()=> {
    const fetchStudent = async () => {
        if(id && !isNaN(Number(id))) {
            loadStudent(Number(id));
            console.log("selectedStudent", selectedStudent);
        }
    }
    fetchStudent();
    }, [loadStudent])

    // Hàm xử lý cập nhật học sinh
    const handleEditStudent = async (id: number, formData: any) => {
        // TODO: Gọi API cập nhật học sinh ở đây
        setOpenEdit(false);
        // window.location.reload(); // hoặc navigate(0) nếu muốn reload lại dữ liệu
    };
    
    // Đặt tiêu đề trang
    usePageTitle(`Chi tiết học sinh - ${selectedStudent?.name || 'Không xác định'}`);

    if (!selectedStudent) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-destructive">Không tìm thấy học sinh</h3>
                    <p className="text-muted-foreground">Học sinh này không tồn tại hoặc đã bị xóa.</p>
                    <Button 
                        onClick={() => navigate('/students')}
                        className="mt-4"
                        variant="outline"
                    >
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
            {/* Back Button */}
            <div className="mb-2">
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate('/student')}
                    className="rounded-full shadow hover:bg-accent transition-colors"
                    aria-label="Quay lại danh sách học sinh"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold truncate">{selectedStudent.name}</h1>
                            {('email' in selectedStudent && typeof selectedStudent.email === 'string' && selectedStudent.email) ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground text-sm truncate">{String(selectedStudent.email)}</span>
                                </div>
                            ) : null}
                            <div className="flex items-center gap-2 mt-1">
                                {selectedStudent.studentDetails?.[0]?.group_name && (
                                    <Badge variant="outline">{selectedStudent.studentDetails[0].group_name}</Badge>
                                )}
                            </div>
                        </div>
                        <Button size="sm" className="ml-2 whitespace-nowrap" onClick={() => setOpenEdit(true)}>
                            <User className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                        <EditStudentDialog 
                            student={selectedStudent}
                            onEditStudent={handleEditStudent}
                            open={openEdit}
                            onOpenChange={setOpenEdit}
                        />
                    </div>
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                                    <p className="text-lg font-semibold">{selectedStudent.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Số điện thoại phụ huynh</label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-mono">{selectedStudent.parentPhone || "Chưa cập nhật"}</p>
                                    </div>
                                </div>
                                {('address' in selectedStudent && typeof selectedStudent.address === 'string' && selectedStudent.address) ? (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Địa chỉ</label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p>{String(selectedStudent.address)}</p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex justify-end mt-2">
                                <Badge variant="outline" className="text-xs text-muted-foreground">ID: {selectedStudent.id}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Academic Information */}
                    {selectedStudent && (
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
                                                <p className="font-semibold">{selectedStudent.studentDetails?.[0]?.group_name}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Trường</label>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <p>{selectedStudent.studentDetails?.[0]?.school?.name || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Lớp</label>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                <p>{selectedStudent.studentDetails?.[0]?.schoolClass?.name || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Khối</label>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <p>{selectedStudent.studentDetails?.[0]?.grade?.name || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Năm học</label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p>{selectedStudent.studentDetails?.[0]?.academicYear?.name || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        {(selectedStudent.studentDetails?.[0] && typeof (selectedStudent.studentDetails?.[0] as any).enrollmentDate === 'string' && (selectedStudent.studentDetails?.[0] as any).enrollmentDate) ? (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">Ngày nhập học</label>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <p>{new Date(String((selectedStudent.studentDetails?.[0] as any).enrollmentDate)).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {/* Sidebar (1/3) */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thao tác nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <Phone className="mr-2 h-4 w-4" />
                                Gọi điện thoại
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Mail className="mr-2 h-4 w-4" />
                                Gửi email
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Xem điểm số
                            </Button>
                        </CardContent>
                    </Card>
                    {/* Student Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Trạng thái học tập</span>
                                    <Badge variant="default">Đang học</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Tình trạng thanh toán</span>
                                    <Badge variant="secondary">Đã thanh toán</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Số buổi học</span>
                                    <span className="font-semibold">12/20</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Liên hệ khẩn cấp</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">SĐT Phụ huynh</label>
                                <p className="font-mono text-sm">{selectedStudent.parentPhone || "Chưa cập nhật"}</p>
                            </div>
                                {(selectedStudent.studentDetails?.[0] && typeof (selectedStudent.studentDetails?.[0] as any).emergencyContact === 'string' && (selectedStudent.studentDetails?.[0] as any).emergencyContact) ? (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">Liên hệ khẩn cấp</label>
                                    <p className="font-mono text-sm">{String((selectedStudent.studentDetails?.[0] as any).emergencyContact)}</p>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin bổ sung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {('createdAt' in selectedStudent && typeof selectedStudent.createdAt === 'string') ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                                        <p>{selectedStudent.createdAt ? new Date(String(selectedStudent.createdAt)).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</p>
                                    </div>
                                ) : null}
                                {('updatedAt' in selectedStudent && typeof selectedStudent.updatedAt === 'string') ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</label>
                                        <p>{selectedStudent.updatedAt ? new Date(String(selectedStudent.updatedAt)).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</p>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}; 