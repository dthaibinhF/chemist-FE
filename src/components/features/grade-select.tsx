import type { FC } from 'react';
import { useEffect } from 'react';

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
}

const GradeSelect: FC<GradeSelectProps> = ({ handleSelect: handleSelectGrade }) => {
  const { grades, handleFetchGrades } = useGrade();

  useEffect(() => {
    if (grades.length === 0) {
      handleFetchGrades();
    }
  }, [grades, handleFetchGrades]);

  return (
    <Select onValueChange={(value) => handleSelectGrade(value)}>
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
