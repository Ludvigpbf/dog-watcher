// viewerSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface ViewerState {
  isViewing: boolean;
}

const initialState: ViewerState = {
  isViewing: false,
};

const viewerSlice = createSlice({
  name: 'viewer',
  initialState,
  reducers: {
    startViewing(state) {
      state.isViewing = true;
    },
    stopViewing(state) {
      state.isViewing = false;
    },
  },
});

export const { startViewing, stopViewing } = viewerSlice.actions;
export default viewerSlice.reducer;
