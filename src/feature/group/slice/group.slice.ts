import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Group } from "@/types/api.types";
import { groupService } from "@/service/group.service";

export interface GroupState {
    groups: Group[];
    group: Group | null;
    loading: boolean;
    error?: string;
}

// Async thunks
export const fetchGroups = createAsyncThunk(
    'group/fetchGroups',
    async () => {
        const response = await groupService.getAllGroups();
        return response;
    }
);

export const fetchGroup = createAsyncThunk(
    'group/fetchGroup',
    async (id: number) => {
        const response = await groupService.getGroupById(id);
        return response;
    }
);

export const createGroup = createAsyncThunk(
    'group/createGroup',
    async (groupData:Group) => {
        const response = await groupService.createGroup(groupData);
        return response;
    }
);

export const updateGroup = createAsyncThunk(
    'group/updateGroup',
    async ({ id, data }: { id: number; data: Group }) => {
        const response = await groupService.updateGroup(id, data);
        return response;
    }
);

export const deleteGroup = createAsyncThunk(
    'group/deleteGroup',
    async (id: number) => {
        await groupService.deleteGroup(id);
        return id;
    }
);

export const fetchGroupsWithDetail = createAsyncThunk(
    'group/fetchGroupsWithDetail',
    async ()=> {
        const response = await groupService.getAllGroupsWithDetail();
        return response;
    }
)

const initialState: GroupState = {
    groups: [],
    group: null,
    loading: false,
    error: undefined,
};

export const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch groups
        builder.addCase(fetchGroups.pending, (state) => {
            state.loading = true;
            state.error = undefined;
        });
        builder.addCase(fetchGroups.fulfilled, (state, action) => {
            state.loading = false;
            state.groups = action.payload;
        });
        builder.addCase(fetchGroups.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Failed to fetch groups';
        });

        //fetch groups with details
        builder.addCase(fetchGroupsWithDetail.pending, (state) => {
            state.loading = true;
            state.error = undefined;
        });
        builder.addCase(fetchGroupsWithDetail.fulfilled, (state, action) => {
            state.loading = false;
            state.groups = action.payload;
        });
        builder.addCase(fetchGroupsWithDetail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Failed to fetch groups with details';
        });

        // Fetch single group
        builder.addCase(fetchGroup.pending, (state) => {
            state.loading = true;
            state.error = undefined;
        });
        builder.addCase(fetchGroup.fulfilled, (state, action) => {
            state.loading = false;
            state.group = action.payload;
        });
        builder.addCase(fetchGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Failed to fetch group';
        });

        // Create group
        builder.addCase(createGroup.pending, (state) => {
            state.loading = true;
            state.error = undefined;
        });
        builder.addCase(createGroup.fulfilled, (state, action) => {
            state.loading = false;
            state.groups = [...state.groups, action.payload];
        });
        builder.addCase(createGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Failed to create group';
        });

        // Update group
        builder.addCase(updateGroup.pending, (state) => {
            state.loading = true;
            state.error = undefined;
        });
        builder.addCase(updateGroup.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.groups.findIndex(g => g.id === action.payload.id);
            if (index !== -1) {
                state.groups[index] = action.payload;
            }
        });
        builder.addCase(updateGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Failed to update group';
        });

        // Delete group
        builder.addCase(deleteGroup.pending, (state) => {
            state.loading = true;
            state.error = undefined;
        });
        builder.addCase(deleteGroup.fulfilled, (state, action) => {
            state.loading = false;
            state.groups = state.groups.filter(g => g.id !== action.payload);
        });
        builder.addCase(deleteGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Failed to delete group';
        });
    },
});

export default groupSlice.reducer;

// Selectors
export const selectGroupsWithDetail = (state: { group: GroupState }) => state.group.groups;
export const selectGroups = (state: { group: GroupState }) => state.group.groups;
export const selectGroup = (state: { group: GroupState }) => state.group.group;
export const selectLoading = (state: { group: GroupState }) => state.group.loading;
export const selectError = (state: { group: GroupState }) => state.group.error;