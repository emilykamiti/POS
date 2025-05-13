// src/state/globalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light',  // Default theme mode
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { setMode } = globalSlice.actions;

export default globalSlice.reducer;
