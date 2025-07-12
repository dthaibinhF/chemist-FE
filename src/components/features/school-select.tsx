import type { FC } from 'react';
import { useEffect, useState } from 'react';

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
  value?: string;
}

const SchoolSelect: FC<SchoolSelectProps> = ({ handleSelect, value }) => {
  const { schools, handleFetchSchools } = useSchool();
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  useEffect(() => {
    if (schools.length === 0) {
      handleFetchSchools();
    }
  }, [schools, handleFetchSchools]);

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (value: string) => {
    setSelectedValue(value);
    handleSelect(value);
  };

  return (
    <Select onValueChange={handleChange} value={selectedValue}>
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
