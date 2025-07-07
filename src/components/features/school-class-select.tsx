import { useEffect } from 'react';

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
}

const SchoolClassSelect = ({ handleSelect, grade }: SchoolClassSelectProps) => {
  const { schoolClasses, handleFetchSchoolClasses } = useSchoolClass();
  let schoolClassFilter = schoolClasses;

  const filterSchoolClass = (grade?: number) => {
    let schoolClassFilter = schoolClasses;
    if (grade == -1 || grade == undefined || grade == null) {
      return schoolClasses;
    } else if (grade == 13) {
      return schoolClasses.filter((schoolClass) => schoolClass.id === (schoolClasses.length))
    }
    else if (grade) {
      return schoolClasses.filter((schoolClass) => schoolClass.name.startsWith(grade.toString()))
    }
    return schoolClassFilter;
  }


  useEffect(() => {
    const load = () => {
      if (schoolClasses.length === 0) {
        handleFetchSchoolClasses();
      }
    }
    load();
  }, [handleFetchSchoolClasses, grade]);

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Chọn lớp học" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Danh sách lớp học</SelectLabel>
          <SelectItem key={-1} value={'-1'}>Không chọn</SelectItem>
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
