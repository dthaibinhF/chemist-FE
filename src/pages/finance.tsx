import { Calendar } from '@/components/ui/calendar';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useState } from 'react';

const FinanceManagement = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  usePageTitle('Quản lý tài chính');

  return <div>
    <Calendar
    mode='single'
      selected={date}
      onSelect={setDate}
    />
  </div>
};

export default FinanceManagement;
