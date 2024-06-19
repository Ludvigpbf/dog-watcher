import { createSlice } from "@reduxjs/toolkit";

const languageSlice = createSlice({
  name: "language",
  initialState: { activeLang: "sv" }, // default language
  reducers: {
    changeLanguage: (_state, action) => ({ activeLang: action.payload }),
  },
});

export const { changeLanguage } = languageSlice.actions;

export default languageSlice.reducer;