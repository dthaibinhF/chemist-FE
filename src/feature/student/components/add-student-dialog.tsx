import { useState, useEffect, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Loader2 } from "lucide-react";
import { studentFormSchema, type StudentFormData } from "../schemas/student.schema";
import { 
    schoolService, 
    gradeService, 
    groupService,
    type School,
    type Grade,
    type GroupList
} from "@/service";

interface AddStudentDialogProps {
    onAddStudent: (formData: StudentFormData) => Promise<void>;
}

export const AddStudentDialog = memo(({ onAddStudent }: AddStudentDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [schools, setSchools] = useState<School[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [groups, setGroups] = useState<GroupList[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const form = useForm<StudentFormData>({
        resolver: zodResolver(studentFormSchema),
        defaultValues: {
            name: "",
            parentPhone: "",
            birthDate: undefined,
            school: "",
            grade: "",
            group: "",
        },
    });

    // Memoize loadAllData function
    const loadAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [schoolsData, gradesData, groupsData] = await Promise.all([
                schoolService.getAllSchools(),
                gradeService.getAllGrades(),
                groupService.getAllGroups()
            ]);
            setSchools(schoolsData);
            setGrades(gradesData);
            setGroups(groupsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load data khi dialog mở
    useEffect(() => {
        if (isOpen) {
            loadAllData();
        }
    }, [isOpen, loadAllData]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        form.reset();
    }, [form]);

    const onSubmit = useCallback(async (data: StudentFormData) => {
        try {
            setSubmitting(true);
            await onAddStudent(data);
            handleClose();
        } catch (error) {
            console.error("Error adding student:", error);
        } finally {
            setSubmitting(false);
        }
    }, [onAddStudent, handleClose]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm học sinh mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Thêm học sinh mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin học sinh mới vào form bên dưới.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ tên *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập họ tên học sinh" 
                                                {...field} 
                                                disabled={submitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="parentPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SĐT Phụ huynh *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nhập số điện thoại" 
                                                {...field} 
                                                disabled={submitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ngày sinh</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Chọn ngày sinh"
                                            maxDate={new Date()}
                                            showLabel={false}
                                            disabled={submitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="school"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trường</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger disabled={loading || submitting}>
                                                    <SelectValue placeholder={loading ? "Đang tải..." : "Chọn trường"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {schools.map((school) => (
                                                    <SelectItem key={school.id} value={school.id?.toString() ?? ""}>
                                                        {school.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Khối</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger disabled={loading || submitting}>
                                                        <SelectValue placeholder={loading ? "Đang tải..." : "Chọn khối"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {grades.map((grade) => (
                                                        <SelectItem key={grade.id} value={grade.id?.toString() ?? ""}>
                                                            {grade.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="group"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nhóm học</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger disabled={loading || submitting}>
                                                        <SelectValue placeholder={loading ? "Đang tải..." : "Chọn nhóm học"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {groups.map((group) => (
                                                        <SelectItem key={group.id} value={group.id?.toString() ?? ""}>
                                                            {group.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting || loading}
                                className="min-w-[100px]"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang thêm...
                                    </>
                                ) : (
                                    "Thêm học sinh"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
});

AddStudentDialog.displayName = "AddStudentDialog"; 