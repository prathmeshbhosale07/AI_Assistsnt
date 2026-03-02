import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const initialState = {
  avatar: "robot",
  assistantName: "Nova",
  language: "en",
  voiceProfile: "default",
  saving: false,
  error: null,
};

export const savePreferences = createAsyncThunk(
  "preferences/save",
  async ({ avatar, assistantName, language, voiceProfile }, thunkAPI) => {
    try {
      const { data } = await axiosClient.put("/users/preferences", {
        avatar,
        assistantName,
        language,
        voiceProfile,
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to save preferences"
      );
    }
  }
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    loadFromUser(state, action) {
      const u = action.payload;
      if (!u) return;
      state.avatar = u.avatar || state.avatar;
      state.assistantName = u.assistantName || state.assistantName;
      state.language = u.language || state.language;
      state.voiceProfile = u.voiceProfile || state.voiceProfile;
    },
    setLanguageLocal(state, action) {
      state.language = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(savePreferences.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.saving = false;
        state.avatar = action.payload.avatar || state.avatar;
        state.assistantName = action.payload.assistantName || state.assistantName;
        state.language = action.payload.language || state.language;
        state.voiceProfile = action.payload.voiceProfile || state.voiceProfile;
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save preferences";
      });
  },
});

export const { loadFromUser, setLanguageLocal } = preferencesSlice.actions;
export default preferencesSlice.reducer;

