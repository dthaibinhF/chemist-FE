import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { Group } from '@/types/api.types';
import { 
    fetchGroups, 
    fetchGroup, 
    createGroup, 
    updateGroup, 
    deleteGroup,
    selectGroups,
    selectGroup,
    selectLoading,
    selectError
} from '../slice/group.slice';

export const useGroup = () => {
    const dispatch = useAppDispatch();
    const groups = useAppSelector(selectGroups);
    const group = useAppSelector(selectGroup);
    const loading = useAppSelector(selectLoading);
    const error = useAppSelector(selectError);

    const handleFetchGroups = () => dispatch(fetchGroups());
    const handleFetchGroup = (id: number) => dispatch(fetchGroup(id));
    const handleCreateGroup = (data: Omit<Group, 'id'>) => dispatch(createGroup(data));
    const handleUpdateGroup = (id: number, data: Omit<Group, 'id'>) => dispatch(updateGroup({ id, data }));
    const handleDeleteGroup = (id: number) => dispatch(deleteGroup(id));

    return {
        // Data
        groups,
        group,
        loading,
        error,

        // Actions
        fetchGroups: handleFetchGroups,
        fetchGroup: handleFetchGroup,
        createGroup: handleCreateGroup,
        updateGroup: handleUpdateGroup,
        deleteGroup: handleDeleteGroup,
    };
};
