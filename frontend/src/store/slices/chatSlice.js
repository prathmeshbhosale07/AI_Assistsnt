import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const initialState = {
  sessionId: null,
  messages: [],
  sessions: [],
  loading: false,
  error: null,
  lastAction: "NONE",
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ sessionId, content }, thunkAPI) => {
    try {
      const { data } = await axiosClient.post("/chat/send", { sessionId, content });
      return data; // { sessionId, reply, action }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to send message"
      );
    }
  }
);

export const fetchHistory = createAsyncThunk("chat/history", async (_, thunkAPI) => {
  try {
    const { data } = await axiosClient.get("/chat/history");
    return data; // array of sessions
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message || "Failed to fetch history"
    );
  }
});

export const deleteSession = createAsyncThunk(
  "chat/deleteSession",
  async (sessionId, thunkAPI) => {
    try {
      const { data } = await axiosClient.delete(`/chat/session/${sessionId}`);
      return data; // { message, sessionId }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to delete session"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addLocalUserMessage(state, action) {
      state.messages.push({ role: "user", content: action.payload });
    },
    clearChat(state) {
      state.sessionId = null;
      state.messages = [];
      state.lastAction = "NONE";
      state.error = null;
    },
    clearLastAction(state) {
      state.lastAction = "NONE";
    },
    loadSession(state, action) {
      const session = action.payload;
      state.sessionId = session._id;
      state.messages = (session.messages || [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
      state.lastAction = "NONE";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.sessionId;
        state.messages.push({ role: "assistant", content: action.payload.reply });
        state.lastAction = action.payload.action || "NONE";
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send message";
      })
      .addCase(fetchHistory.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const sessions = action.payload || [];
        state.sessions = sessions;
        const latest = sessions[0];
        if (!latest) return;
        state.sessionId = latest._id;
        state.messages = (latest.messages || [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch history";
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        const deletedId = action.payload.sessionId;
        state.sessions = state.sessions.filter(s => s._id !== deletedId);
        if (state.sessionId === deletedId) {
          state.sessionId = null;
          state.messages = [];
          state.lastAction = "NONE";
          state.error = null;
        }
      });
  },
});

export const { addLocalUserMessage, clearChat, clearLastAction, loadSession } = chatSlice.actions;
export default chatSlice.reducer;

