import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { useGrade } from '@/hooks/useGrade';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface GradeSelectProps {
  handleSelect: (value: string) => void;
  value?: string;
}

const GradeSelect: FC<GradeSelectProps> = ({ handleSelect, value }) => {
  const { grades, handleFetchGrades } = useGrade();
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  useEffect(() => {
    if (grades.length === 0) {
      handleFetchGrades();
    }
  }, [grades, handleFetchGrades]);

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
        <SelectValue placeholder="Chọn khối lớp" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Danh sách khối lớp</SelectLabel>
          <SelectItem value="-1">Không chọn</SelectItem>
          {grades.map((grade) => (
            <SelectItem key={grade.id} value={grade.id?.toString() ?? ''}>
              {grade.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default GradeSelect;
