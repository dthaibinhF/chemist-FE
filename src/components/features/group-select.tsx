import type { FC } from 'react';
import { useEffect } from 'react';

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

interface SelectGroup {
  handleSelectGroup: (value: string) => void;
}

const GroupSelect: FC<SelectGroup> = ({ handleSelectGroup }) => {
  const { groups, fetchGroups } = useGroup();

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
  }, [groups, fetchGroups]);

  return (
    <Select onValueChange={(value) => handleSelectGroup(value)}>
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
