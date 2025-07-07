import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  value?: Date | undefined;
  onValueChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  buttonClassName?: string;
  required?: boolean;
  error?: string;
  id?: string;
  name?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showLabel?: boolean;
}

export function DatePicker({
  label,
  placeholder = 'Chọn ngày',
  value,
  onValueChange,
  disabled = false,
  className,
  labelClassName,
  buttonClassName,
  required = false,
  error,
  id,
  name,
  minDate,
  maxDate,
  disabledDates,
  showLabel = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onValueChange?.(date);
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showLabel && label && (
        <Label htmlFor={id} className={cn('px-1 text-sm font-medium', labelClassName)}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            name={name}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              error && 'border-red-500 focus:border-red-500',
              buttonClassName
            )}
          >
            {value ? value.toLocaleDateString('vi-VN') : placeholder}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
            captionLayout="dropdown"
            fromYear={minDate?.getFullYear() || 1900}
            toYear={maxDate?.getFullYear() || new Date().getFullYear() + 10}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              if (disabledDates?.some((disabledDate) => disabledDate.getTime() === date.getTime()))
                return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}
    </div>
  );
}
