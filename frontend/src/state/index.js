import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: localStorage.getItem("theme") || "dark",
  userId: null, // Start as null, set after login
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    selMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const { selMode, setUserId } = globalSlice.actions;
export default globalSlice.reducer;