import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Control, useFieldArray } from "react-hook-form";

const Days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
]

interface FormAddGroupSchedule {
    control: Control<any>,
    name: string,
    fields: any[]
}

export const FormAddGroupSchedule = ({ control, name }: FormAddGroupSchedule) => {
    const [mousePosition, setMousePosition] = useState({ x: 0 });
    const [isHover, setIsHover] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setMousePosition({ x });
    };

    const handleAddSchedule = () => {
        append({
            day_of_week: "MONDAY",
            start_time: "00:00",
            end_time: "00:00",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header with add button */}
            <div className="flex items-center gap-4 w-full relative group">
                <h3 className="text-lg font-medium whitespace-nowrap">Lịch học</h3>
                <div
                    className="flex-1 relative cursor-pointer"
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                    onMouseMove={handleMouseMove}
                >
                    <div className="relative">
                        <Separator className="my-4" />
                        {isHover && (
                            <div
                                className="absolute top-1/2 -translate-y-0 z-10"
                                style={{
                                    left: `${mousePosition.x}px`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full bg-background border-2 hover:bg-accent p-0.5"
                                    onClick={handleAddSchedule}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule Fields */}
            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="relative p-6 border rounded-lg bg-card">
                        {/* Delete Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Schedule Number */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Buổi học #{index + 1}
                            </h4>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-3 gap-6">
                            <FormField
                                control={control}
                                name={`${name}[${index}].day_of_week`}
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Ngày học</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.field.onChange}
                                                defaultValue={field.field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Thứ mấy?" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {Days.map(day => (
                                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`${name}[${index}].start_time`}
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Thời gian bắt đầu</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field.field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`${name}[${index}].end_time`}
                                render={(field) => (
                                    <FormItem>
                                        <FormLabel>Thời gian tan học</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field.field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}