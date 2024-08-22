import { createSlice } from "@reduxjs/toolkit";

interface BroadcastState {
  isBroadcasting: boolean;
}

const initialState: BroadcastState = {
  isBroadcasting: false,
};

const broadcastSlice = createSlice({
  name: "broadcast",
  initialState,
  reducers: {
    startBroadcast(state) {
      state.isBroadcasting = true;
    },
    stopBroadcast(state) {
      state.isBroadcasting = false;
    },
  },
});

export const { startBroadcast, stopBroadcast } = broadcastSlice.actions;
export default broadcastSlice.reducer;
