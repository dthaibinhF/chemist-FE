import { cn } from "@/lib/utils"
import { Select, SelectItem, SelectContent, SelectTrigger } from "../ui/select"
import { SelectValue } from "../ui/select"

export interface DataSelectProps<T> {
    items: T[],
    valueKey?: keyof T,
    labelKey?: keyof T,
    defaultValue?: string | number,
    onChange: (value: number) => void,
    placeholder?: string,
    className?: string,
}

export const DataSelect = <T,>({
    items,
    valueKey,
    labelKey,
    defaultValue,
    onChange,
    placeholder,
    className,
}: DataSelectProps<T>) => {
    const valueK = (valueKey ?? "id") as keyof T;
    const labelK = (labelKey ?? "name") as keyof T;

    return (
        <Select
            onValueChange={(value) => onChange(Number(value))}
            defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
        >
            <SelectTrigger className={cn(className)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {items.map((item, idx) => (
                    <SelectItem
                        key={String(item[valueK] ?? idx)}
                        value={String(item[valueK])}
                    >
                        {String(item[labelK])}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
