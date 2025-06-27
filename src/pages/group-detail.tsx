import { useParams } from "react-router-dom";
import { useGroup } from "@/feature/group/hooks/useGroup";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { useFee } from "@/hooks/useFee";
import { useStudent } from "@/feature/student/hooks/useStudent";
import { StudentTable } from "@/feature/student/components";
// import { columns } from "@/feature/student/components/student-table";

export const GroupDetail = () => {
    const { id } = useParams();
    const { group, fetchGroup } = useGroup();
    const { fees } = useFee();
    const { students } = useStudent();

    useEffect(() => {
        if (id) {
            fetchGroup(parseInt(id));
        }
    }, [id, fetchGroup]);

    if (!group) return null;

    const groupFee = fees.find(fee => fee.id === group.fee_id);
    const groupStudents = students.filter(student =>
        student.studentDetails?.some(detail => detail.group_id === group.id)
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
                <p className="text-muted-foreground">Chi tiết nhóm học</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loại nhóm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge>{group.level}</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Học phí</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {groupFee?.amount.toLocaleString('vi-VN')} VNĐ
                        </div>
                        <p className="text-xs text-muted-foreground">{groupFee?.name}</p>
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
                            <StudentTable
                                students={groupStudents}
                                onViewStudent={() => { }}
                                onEditStudent={() => { }}
                                onDeleteStudent={() => { }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    {/* Schedule content */}
                </TabsContent>

                <TabsContent value="attendance">
                    {/* Attendance content */}
                </TabsContent>
            </Tabs>
        </div>
    );
};