import type { Column } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface ButtonSortingDataTableProps {
  column: Column<any, any>;
  label: string;
  className?: string;
}

export const ButtonSortingDataTable = ({
  column,
  label,
  className,
}: ButtonSortingDataTableProps) => {
  return (
    <div className={cn('w-full', className)}>
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
