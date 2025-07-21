import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  createRoom,
  deleteRoom,
  fetchRoom,
  fetchRooms,
  updateRoom,
} from "@/redux/slice/room.slice";
import type { Room } from "@/types/api.types";
import { useCallback } from "react";

export const useRoom = () => {
  const dispatch = useAppDispatch();
  const { rooms, room, loading, error } = useAppSelector((state) => state.room);

  const handleFetchRooms = useCallback(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleFetchRoom = useCallback(
    (id: number) => {
      dispatch(fetchRoom(id));
    },
    [dispatch]
  );

  const handleCreateRoom = useCallback(
    (room: Room) => {
      dispatch(createRoom(room));
    },
    [dispatch]
  );

  const handleUpdateRoom = useCallback(
    (id: number, room: Room) => {
      dispatch(updateRoom({ id, room }));
    },
    [dispatch]
  );

  const handleDeleteRoom = useCallback(
    (id: number) => {
      dispatch(deleteRoom(id));
    },
    [dispatch]
  );

  return {
    rooms,
    room,
    loading,
    error,
    handleFetchRooms,
    handleFetchRoom,
    handleCreateRoom,
    handleUpdateRoom,
    handleDeleteRoom,
  };
};
