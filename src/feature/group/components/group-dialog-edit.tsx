import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { DataSelect } from '@/components/common/data-select';
import { FeeSelect } from '@/components/features/fee-select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGrade } from '@/hooks';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useFee } from '@/hooks/useFee';
import { useRoom } from '@/hooks/useRoom';
import type { Group, GroupSchedule } from '@/types/api.types';
import { Edit } from 'lucide-react';

import { useGroup } from '@/hooks/useGroup';
import { FormAddGroupSchedule } from './form-add-group-schedule';

// Days of the week for the select dropdown
const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const GroupSchema = z.object({
    name: z.string().min(1, { message: 'Hãy nhập tên nhóm' }),
    level: z.enum(['REGULAR', 'ADVANCED', 'VIP'], {
        message: 'Hãy chọn loại nhóm',
    }),
    fee_id: z.number().min(1, { message: 'Hãy chọn học phí' }),
    academic_year_id: z.number().min(1, { message: 'Hãy chọn năm học' }),
    grade_id: z.number().min(1, { message: 'Hãy chọn khối lớp' }),
    group_schedules: z.array(
        z.object({
            day_of_week: z.enum(daysOfWeek, { message: 'Hãy chọn ngày trong tuần' }),
            start_time: z.string().min(1, { message: 'Hãy chọn thời gian bắt đầu' }),
            end_time: z.string().min(1, { message: 'Hãy chọn thời gian kết thúc' }),
            room_id: z.number().min(1, { message: 'Hãy chọn phòng học' }),
        })
    ),
});

interface GroupDialogEditProps {
    group: Group;
    variant?: 'button' | 'dropdown';
}

const GroupDialogEdit = ({ group, variant = 'button' }: GroupDialogEditProps) => {
    const [open, setOpen] = useState(false);
    const { handleUpdateGroup, loading } = useGroup();
    const { grades, handleFetchGrades, loading: loadingGrades } = useGrade();
    const { fees, handleFetchFees, loading: loadingFees } = useFee();
    const { rooms, handleFetchRooms, loading: loadingRooms } = useRoom();
    const {
        academicYears,
        handleFetchAcademicYears,
        loading: loadingAcademicYears,
    } = useAcademicYear();


    // Convert group schedules to form format
    const convertSchedulesToForm = (schedules?: GroupSchedule[]) => {
        if (!schedules || schedules.length === 0) {
            return [
                {
                    day_of_week: 'MONDAY' as const,
                    start_time: '08:00:00',
                    end_time: '10:00:00',
                    room_id: 0,
                },
            ];
        }

        return schedules.map((schedule) => {
            // Properly handle room_id - use room_id first, then fallback to room.id
            let roomId = 0;
            if (schedule.room_id) {
                roomId = schedule.room_id;
            } else if (schedule.room_name) {
                roomId = schedule?.room_id || 0;
            }

            console.log('Converting schedule:', {
                scheduleRoomId: schedule.room_id,
                scheduleRoom: schedule.room_name,
                finalRoomId: roomId
            });

            return {
                day_of_week: schedule.day_of_week,
                // GroupSchedule times are already in Vietnam local time (LocalTimeString)
                // No conversion needed - use as-is
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                room_id: roomId,
            };
        });
    };
    const form = useForm<z.infer<typeof GroupSchema>>({
        resolver: zodResolver(GroupSchema),
        defaultValues: {
            name: group.name || '',
            level: group.level || 'REGULAR',
            fee_id: group.fee_id || 0,
            academic_year_id: group.academic_year_id || 0,
            grade_id: group.grade_id || 0,
            group_schedules: convertSchedulesToForm(group.group_schedules),
        },
    });

    useEffect(() => {
        if (open) {
            // Load all required data first
            handleFetchGrades();
            handleFetchAcademicYears();
            handleFetchFees();
            handleFetchRooms();
        }
    }, [open, handleFetchGrades, handleFetchAcademicYears, handleFetchFees, handleFetchRooms]);

    // Reset form only after all data is loaded
    useEffect(() => {
        if (open && !loadingGrades && !loadingAcademicYears && !loadingFees && !loadingRooms) {
            const formData = {
                name: group.name || '',
                level: group.level || 'REGULAR',
                fee_id: group.fee_id || 0,
                academic_year_id: group.academic_year_id || 0,
                grade_id: group.grade_id || 0,
                group_schedules: convertSchedulesToForm(group.group_schedules),
            };

            console.log('Resetting form with data:', formData);
            form.reset(formData);
        }
    }, [open, group, loadingGrades, loadingAcademicYears, loadingFees, loadingRooms, form]);

    const handleUpdateGroupForm = async (data: z.infer<typeof GroupSchema>) => {
        try {
            const updatedGroup: Partial<Group> = {
                ...group,
                name: data.name,
                level: data.level,
                fee_id: data.fee_id,
                academic_year_id: data.academic_year_id,
                grade_id: data.grade_id,
                group_schedules: data.group_schedules.map((schedule) => ({
                    day_of_week: schedule.day_of_week,
                    // GroupSchedule times should remain in Vietnam local time (LocalTimeString)
                    // No conversion needed - send as-is
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    room_id: schedule.room_id,
                })),
            };

            await handleUpdateGroup(group.id as number, updatedGroup as Group);
            toast.success('Cập nhật nhóm thành công');
            setOpen(false);
        } catch (error) {
            toast.error('Cập nhật nhóm thất bại');
            console.log(error);
        }
    };

    const isLoading = loading || loadingGrades || loadingAcademicYears || loadingFees || loadingRooms;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === 'dropdown' ? (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </DropdownMenuItem>
                ) : (
                    <Button variant="outline" className="flex items-center gap-2 px-4 py-2" >
                        <Edit className="size-4" />
                        Chỉnh sửa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
                    <DialogDescription>Cập nhật thông tin nhóm {group.name}.</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-muted-foreground">Đang tải...</p>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdateGroupForm)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên nhóm</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập tên nhóm" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loại nhóm</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Chọn loại nhóm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="REGULAR">Thường</SelectItem>
                                                            <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                                                            <SelectItem value="VIP">VIP</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="academic_year_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Năm học</FormLabel>
                                            <FormControl>
                                                <DataSelect
                                                    items={academicYears}
                                                    labelKey="year"
                                                    valueKey="id"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Chọn năm học"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="grade_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Khối lớp</FormLabel>
                                            <FormControl>
                                                <DataSelect
                                                    items={grades}
                                                    labelKey="name"
                                                    valueKey="id"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Chọn khối lớp"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="fee_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Học phí</FormLabel>
                                        <FormControl>
                                            <FeeSelect
                                                onSelect={(fee) => field.onChange(fee.id)}
                                                value={fees.find((fee) => fee.id === field.value)?.id?.toString()}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Group Schedules */}
                            <FormAddGroupSchedule
                                control={form.control}
                                name="group_schedules"
                                fields={form.watch('group_schedules')}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật nhóm'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GroupDialogEdit;