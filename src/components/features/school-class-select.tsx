import { useEffect, useState } from 'react';

import { useSchoolClass } from '@/hooks/useSchoolClass';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SchoolClassSelectProps {
  grade?: number;
  handleSelect: (value: string) => void;
  value?: string;
}

const SchoolClassSelect = ({ handleSelect, grade, value }: SchoolClassSelectProps) => {
  const { schoolClasses, handleFetchSchoolClasses } = useSchoolClass();
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  const filterSchoolClass = (grade?: number) => {
    if (grade == -1 || grade == undefined || grade == null) {
      return schoolClasses;
    } else if (grade == 13) {
      return schoolClasses.filter((schoolClass) => schoolClass.id === schoolClasses.length);
    } else if (grade) {
      return schoolClasses.filter((schoolClass) => schoolClass.name.startsWith(grade.toString()));
    }
    return schoolClasses;
  };

  useEffect(() => {
    const load = () => {
      if (schoolClasses.length === 0) {
        handleFetchSchoolClasses();
      }
    };
    load();
  }, [handleFetchSchoolClasses, grade]);

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
        <SelectValue placeholder="Chọn lớp học" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Danh sách lớp học</SelectLabel>
          <SelectItem value="-1">Không chọn</SelectItem>
          {filterSchoolClass(grade).map((schoolClass) => (
            <SelectItem key={schoolClass.id} value={schoolClass.id?.toString() ?? ''}>
              {schoolClass.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SchoolClassSelect;
