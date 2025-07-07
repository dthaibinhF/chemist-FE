import type { FC } from 'react';
import { useEffect } from 'react';

import { useSchool } from '@/hooks/useSchool';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SchoolSelectProps {
  handleSelect: (value: string) => void;
}

const SchoolSelect: FC<SchoolSelectProps> = ({ handleSelect: handleSelectSchool }) => {
  const { schools, handleFetchSchools } = useSchool();

  useEffect(() => {
    if (schools.length === 0) {
      handleFetchSchools();
    }
  }, [schools, handleFetchSchools]);

  return (
    <Select onValueChange={(value) => handleSelectSchool(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Chọn trường" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Danh sách trường</SelectLabel>
          <SelectItem value="-1">Không chọn</SelectItem>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id?.toString() ?? ''}>
              {school.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SchoolSelect;
