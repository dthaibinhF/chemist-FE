import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Input } from './input';

// Re-export base select components
export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from './select';

interface SearchableSelectProps {
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'default';
    showSearch?: boolean;
}

function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    disabled = false,
    className,
    size = 'default',
    showSearch = true,
}: SearchableSelectProps) {
    const [searchValue, setSearchValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const filteredOptions = React.useMemo(() => {
        if (!searchValue.trim()) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [options, searchValue]);

    const selectedOption = React.useMemo(() => {
        return options.find((option) => option.value === value);
    }, [options, value]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setSearchValue('');
        }
    };

    // Don't auto-focus the search input - let user control focus manually
    // This prevents the annoying focus behavior when typing

    return (
        <SelectPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            onOpenChange={handleOpenChange}
            disabled={disabled}
        >
            <SelectPrimitive.Trigger
                data-slot="select-trigger"
                data-size={size}
                className={cn(
                    "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    className
                )}
            >
                <SelectPrimitive.Value placeholder={placeholder}>
                    {selectedOption?.label}
                </SelectPrimitive.Value>
                <SelectPrimitive.Icon asChild>
                    <ChevronDownIcon className="size-4 opacity-50" />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    data-slot="select-content"
                    className={cn(
                        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
                        'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'
                    )}
                    position="popper"
                >
                    <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
                        <ChevronUpIcon className="size-4" />
                    </SelectPrimitive.ScrollUpButton>

                    <SelectPrimitive.Viewport className={cn("p-1", showSearch && "pt-0")}>
                        {showSearch && (
                            <div className="sticky top-0 z-10 bg-popover p-2 border-b -mt-1 -mx-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        ref={searchInputRef}
                                        placeholder={searchPlaceholder}
                                        value={searchValue}
                                        onChange={handleSearchChange}
                                        className="pl-9 h-8 text-sm"
                                        onKeyDown={(e) => {
                                            // Prevent the select from capturing arrow keys when typing in search
                                            if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
                                                e.stopPropagation();
                                            }
                                            // Allow normal typing behavior without focus issues
                                            if (e.key.length === 1) {
                                                e.stopPropagation();
                                            }
                                        }}
                                        onFocus={(e) => {
                                            // Prevent focus from bubbling up to the select trigger
                                            e.stopPropagation();
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {filteredOptions.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className={cn(
                                        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"
                                    )}
                                >
                                    <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                        <SelectPrimitive.ItemIndicator>
                                            <CheckIcon className="size-4" />
                                        </SelectPrimitive.ItemIndicator>
                                    </span>
                                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                                </SelectPrimitive.Item>
                            ))
                        )}
                    </SelectPrimitive.Viewport>

                    <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
                        <ChevronDownIcon className="size-4" />
                    </SelectPrimitive.ScrollDownButton>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

export { SearchableSelect };

