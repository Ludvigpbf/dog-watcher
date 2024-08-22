// webrtcSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebRTCState {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

const initialState: WebRTCState = {
  connectionStatus: 'disconnected',
};

const webRTCSlice = createSlice({
  name: 'webrtc',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<'connecting' | 'connected' | 'disconnected'>) {
      state.connectionStatus = action.payload;
    },
  },
});

export const { setConnectionStatus } = webRTCSlice.actions;
export default webRTCSlice.reducer;
