import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useRoom } from '@/hooks/useRoom';

interface RoomSelectProps {
    handleSelect: (value: string | number) => void;
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
}

const RoomSchema = z.object({
    name: z.string().min(1, { message: 'Hãy nhập tên phòng' }),
    location: z.string().min(1, { message: 'Hãy nhập vị trí phòng' }),
    capacity: z.number().min(1, { message: 'Sức chứa phải lớn hơn 0' }),
});

const RoomSelect: FC<RoomSelectProps> = ({ handleSelect, value, placeholder = "Chọn phòng", disabled = false }) => {
    const { rooms, handleFetchRooms, handleCreateRoom } = useRoom();
    const [selectedValue, setSelectedValue] = useState<string>(() => {
        // Better initial value handling
        if (value !== undefined && value !== null && value !== 0) {
            return value.toString();
        }
        return '';
    });
    const [isNewRoomDialogOpen, setIsNewRoomDialogOpen] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);

    const roomForm = useForm<z.infer<typeof RoomSchema>>({
        resolver: zodResolver(RoomSchema),
        defaultValues: {
            name: '',
            location: '',
            capacity: 1,
        },
    });

    useEffect(() => {
        if (rooms.length === 0) {
            handleFetchRooms();
        }
    }, [rooms, handleFetchRooms]);

    useEffect(() => {

        if (value !== undefined && value !== null && value !== 0) {
            const stringValue = value.toString();
            // Only update if different to avoid unnecessary re-renders
            if (stringValue !== selectedValue) {
                setSelectedValue(stringValue);
            }
        } else {
            // Handle empty/zero values
            if (selectedValue !== '') {
                setSelectedValue('');
            }
        }
    }, [value, rooms, selectedValue]);

    const options = [
        { value: '-1', label: 'Không chọn' },
        ...rooms.map((room) => ({
            value: room.id?.toString() ?? '',
            label: `${room.name} - ${room.location}`,
        })),
        { value: 'new', label: '+ Tạo phòng mới...' },
    ];

    const handleChange = (val: string) => {
        if (val === 'new') {
            setIsNewRoomDialogOpen(true);
            return;
        }
        setSelectedValue(val);
        // Convert to number if it's a valid room ID, otherwise pass as string
        const numericValue = val === '-1' ? '' : Number(val);
        handleSelect(numericValue || val);
    };

    const handleCreateNewRoom = async (data: z.infer<typeof RoomSchema>) => {
        try {
            setCreatingRoom(true);
            const newRoom = {
                name: data.name,
                location: data.location,
                capacity: data.capacity,
            };

            const result = await handleCreateRoom(newRoom);
            
            // Auto-select the newly created room
            if (result && 'payload' in result && result.payload) {
                const createdRoom = result.payload as any;
                const roomId = createdRoom.id?.toString();
                if (roomId) {
                    setSelectedValue(roomId);
                    handleSelect(createdRoom.id);
                }
            }
            
            toast.success('Tạo phòng mới thành công');
            setIsNewRoomDialogOpen(false);
            roomForm.reset();
            handleFetchRooms();
        } catch (error) {
            toast.error('Không thể tạo phòng mới');
        } finally {
            setCreatingRoom(false);
        }
    };

    return (
        <div>
            <SearchableSelect
                options={options}
                value={selectedValue}
                onValueChange={handleChange}
                placeholder={placeholder}
                searchPlaceholder="Tìm kiếm phòng..."
                className="w-full"
                disabled={disabled}
            />

            <Dialog open={isNewRoomDialogOpen} onOpenChange={setIsNewRoomDialogOpen}>
                <DialogContent aria-describedby="dialog-description">
                    <DialogHeader>
                        <DialogTitle>Tạo phòng mới</DialogTitle>
                        <DialogDescription id="dialog-description" className="text-sm text-muted-foreground">
                            Điền thông tin để tạo phòng học mới
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...roomForm}>
                        <form onSubmit={roomForm.handleSubmit(handleCreateNewRoom)} className="space-y-4">
                            <FormField
                                control={roomForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên phòng</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập tên phòng" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={roomForm.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vị trí</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nhập vị trí phòng" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={roomForm.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sức chứa</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                min="1"
                                                placeholder="Nhập sức chứa phòng"
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsNewRoomDialogOpen(false)}
                                    disabled={creatingRoom}
                                >
                                    Hủy
                                </Button>
                                <Button type="button" onClick={roomForm.handleSubmit(handleCreateNewRoom)} disabled={creatingRoom}>
                                    {creatingRoom ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Tạo phòng'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RoomSelect;