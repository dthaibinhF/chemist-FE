import type { GroupList } from '@/types/api.types';

export interface GroupListItem extends GroupList {
  onEdit?: (group: GroupList) => void;
  onDelete?: (id: number) => void;
}
