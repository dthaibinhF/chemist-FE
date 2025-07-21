import { roomService } from "@/service/room.service";
import type { Room } from "@/types/api.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface RoomState {
  rooms: Room[];
  room: Room | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  room: null,
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk("room/fetchRooms", async () => {
  const response = await roomService.getAllRooms();
  return response;
});

export const fetchRoom = createAsyncThunk(
  "room/fetchRoom",
  async (id: number) => {
    const response = await roomService.getRoomById(id);
    return response;
  }
);

export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (room: Room) => {
    const response = await roomService.createRoom(room);
    return response;
  }
);

export const updateRoom = createAsyncThunk(
  "room/updateRoom",
  async ({ id, room }: { id: number; room: Room }) => {
    const response = await roomService.updateRoom(id, room);
    return response;
  }
);

export const deleteRoom = createAsyncThunk(
  "room/deleteRoom",
  async (id: number) => {
    await roomService.deleteRoom(id);
    return id;
  }
);

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.room = action.payload;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rooms.findIndex(
          (room) => room.id === action.payload.id
        );
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter((room) => room.id !== action.payload);
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch rooms";
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch room";
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create room";
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update room";
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete room";
      });
  },
});

export default roomSlice.reducer;
