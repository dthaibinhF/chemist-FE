import type { FC } from 'react';
import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useGroup } from '../../feature/group/hooks/useGroup';

interface GroupSelectProps {
  handleSelect: (value: string) => void;
  value?: string;
}

const GroupSelect: FC<GroupSelectProps> = ({ handleSelect, value }) => {
  const { groups, fetchGroups } = useGroup();
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
  }, [groups, fetchGroups]);

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
        <SelectValue placeholder="Chọn nhóm học" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Danh sách nhóm học</SelectLabel>
          <SelectItem value="-1">Không chọn</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id?.toString() ?? ''}>
              {group.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default GroupSelect;
