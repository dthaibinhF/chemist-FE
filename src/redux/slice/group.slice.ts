import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { groupService } from "@/service/group.service";
import type { Group } from "@/types/api.types";

export interface GroupState {
  groups: Group[];
  group: Group | null;
  loading: boolean;
  error: string | null;
}

export const initialState: GroupState = {
  groups: [],
  group: null,
  loading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk("group/fetchGroups", async () => {
  const response = await groupService.getAllGroups();
  return response;
});

export const fetchGroupsWithDetail = createAsyncThunk(
  "group/fetchGroupsWithDetail",
  async () => {
    const response = await groupService.getAllGroupsWithDetail();
    return response;
  }
);

export const fetchGroup = createAsyncThunk(
  "group/fetchGroup",
  async (id: number) => {
    const response = await groupService.getGroupById(id);
    return response;
  }
);

export const fetchGroupByName = createAsyncThunk(
  "group/fetchGroupByName",
  async (name: string) => {
    const response = await groupService.getGroupByName(name);
    return response;
  }
);

export const createGroup = createAsyncThunk(
  "group/createGroup",
  async (group: Group) => {
    const response = await groupService.createGroup(group);
    return response;
  }
);

export const updateGroup = createAsyncThunk(
  "group/updateGroup",
  async ({ id, group }: { id: number; group: Group }) => {
    const response = await groupService.updateGroup(id, group);
    return response;
  }
);

export const deleteGroup = createAsyncThunk(
  "group/deleteGroup",
  async (id: number) => {
    await groupService.deleteGroup(id);
    return id;
  }
);

export const generateInvoices = createAsyncThunk(
  "group/generateInvoices",
  async (groupId: number) => {
    const response = await groupService.generateInvoices(groupId);
    return response;
  }
);

export const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch groups
    builder.addCase(fetchGroups.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.loading = false;
      state.groups = action.payload;
    });
    builder.addCase(fetchGroups.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch groups";
    });
    // fetch groups with detail
    builder.addCase(fetchGroupsWithDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupsWithDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.groups = action.payload;
    });
    builder.addCase(fetchGroupsWithDetail.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message ?? "Failed to fetch groups with detail";
    });
    // fetch group
    builder.addCase(fetchGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroup.fulfilled, (state, action) => {
      state.loading = false;
      state.group = action.payload;
    });
    builder.addCase(fetchGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch group";
    });
    // fetch group by name
    builder.addCase(fetchGroupByName.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupByName.fulfilled, (state, action) => {
      state.loading = false;
      state.group = action.payload;
    });
    builder.addCase(fetchGroupByName.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch group by name";
    });
    // create group
    builder.addCase(createGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.loading = false;
      state.groups.push(action.payload);
    });
    builder.addCase(createGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to create group";
    });
    // update group
    builder.addCase(updateGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateGroup.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.id
      );
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
      if (state.group && state.group.id === action.payload.id) {
        state.group = action.payload;
      }
    });
    builder.addCase(updateGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to update group";
    });
    // delete group
    builder.addCase(deleteGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteGroup.fulfilled, (state, action) => {
      state.loading = false;
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload
      );
    });
    builder.addCase(deleteGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to delete group";
    });
    // generate invoices
    builder.addCase(generateInvoices.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(generateInvoices.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(generateInvoices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to generate invoices";
    });
  },
});

export default groupSlice.reducer;

// Selectors
export const selectGroups = (state: { group: GroupState }) =>
  state.group.groups;
export const selectGroup = (state: { group: GroupState }) => state.group.group;
export const selectLoading = (state: { group: GroupState }) =>
  state.group.loading;
export const selectError = (state: { group: GroupState }) => state.group.error;
