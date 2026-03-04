import { useEffect, useMemo, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Layout from "../components/Layout.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import MessageInput from "../components/chat/MessageInput.jsx";
import RobotAvatar from "../components/chat/RobotAvatar.jsx";
import { addLocalUserMessage, clearChat, clearLastAction, fetchHistory, loadSession, sendMessage, deleteSession } from "../store/slices/chatSlice";
import { loadFromUser } from "../store/slices/preferencesSlice";
import { detectTopic, TOPIC_BACKGROUNDS } from "../utils/topicDetection";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const { sessionId, messages, sessions, loading, lastAction, error } = useAppSelector((s) => s.chat);
  const prefs = useAppSelector((s) => s.preferences);

  const [robotStatus, setRobotStatus] = useState("idle");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("default");
  const previousMessagesLength = useRef(0);

  const audio = useMemo(() => {
    // If you add a file at /public/sample.mp3 this will play it.
    // Otherwise it tries a demo URL.
    const url = "/sample.mp3";
    const a = new Audio(url);
    a.preload = "none";
    a.onerror = () => {
      a.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    };
    return a;
  }, []);

  useEffect(() => {
    dispatch(loadFromUser(authUser));
    dispatch(fetchHistory());
  }, [authUser, dispatch]);

  useEffect(() => {
    if (lastAction === "PLAY_SONG") {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      dispatch(clearLastAction());
    }
  }, [audio, dispatch, lastAction]);

  // TTS logic for new assistant messages
  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && latestMsg.role === "assistant" && !loading) {
        // Speak the message
        if (isTTSEnabled && "speechSynthesis" in window) {
          const synth = window.speechSynthesis;
          synth.cancel(); // Cancel any ongoing speech
          const utterance = new SpeechSynthesisUtterance(latestMsg.content);
          
          if (prefs.voiceProfile && prefs.voiceProfile !== "default") {
            const voices = synth.getVoices();
            const selectedVoice = voices.find(v => v.name === prefs.voiceProfile);
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
          }
          
          utterance.onstart = () => setRobotStatus("speaking");
          utterance.onend = () => setRobotStatus("idle");
          utterance.onerror = () => setRobotStatus("idle");
          
          synth.speak(utterance);
        }
      }
    }
    previousMessagesLength.current = messages.length;
  }, [messages, loading, prefs.voiceProfile, isTTSEnabled]);

  // Topic detection logic based on user messages
  useEffect(() => {
    if (messages.length > 0) {
      // Find the last user message to determine topic
      const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
      if (lastUserMsg && lastUserMsg.content) {
        const detected = detectTopic(lastUserMsg.content);
        if (detected) {
          setCurrentTopic(detected);
        }
      }
    } else {
      // Revert to default on new chat
      setCurrentTopic("default");
    }
  }, [messages]);

  const onSend = (content) => {
    dispatch(addLocalUserMessage(content));
    dispatch(sendMessage({ sessionId, content }));
  };

  return (
    <Layout>
      <div className="flex h-full flex-col relative bg-transparent overflow-hidden">
        
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 z-0">
          {Object.entries(TOPIC_BACKGROUNDS).map(([topicKey, bgUrl]) => (
            <img 
              key={topicKey}
              src={bgUrl}
              alt={`${topicKey} background`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                currentTopic === topicKey ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* Dark / blur overlay for text contrast relative to the image */}
          <div className="absolute inset-0 bg-slate-100/70 dark:bg-slate-950/80 backdrop-blur-[2px] transition-colors" />
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
          <div className="pointer-events-auto scale-[0.6] origin-top opacity-50 hover:opacity-100 transition-opacity">
            <RobotAvatar status={robotStatus} />
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            History
          </button>
          <button 
            onClick={() => {
              dispatch(clearChat());
              setIsSidebarOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Chat
          </button>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setIsTTSEnabled(!isTTSEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md border rounded-lg shadow-sm text-sm font-medium transition ${
              isTTSEnabled 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50 hover:bg-emerald-100" 
                : "bg-white/80 text-slate-500 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {isTTSEnabled ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            )}
            Voice: {isTTSEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="absolute inset-0 z-30 flex">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl flex flex-col transform transition-transform">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Chat History</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session._id}
                      className={`group flex items-center justify-between w-full rounded-lg transition-colors ${
                        session._id === sessionId 
                          ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <button
                        onClick={() => {
                          dispatch(loadSession(session));
                          setIsSidebarOpen(false);
                        }}
                        className={`flex-1 text-left px-3 py-2 rounded-lg text-sm truncate pr-2 ${
                          session._id === sessionId
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="truncate font-medium">
                           {session.messages?.find?.(m => m.role === "user")?.content || "New conversation"}
                        </div>
                        <div className="text-[10px] opacity-70 mt-1">
                          {new Date(session.updatedAt || session.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteSession(session._id));
                        }}
                        className="p-2 mr-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 flex-shrink-0"
                        title="Delete Chat"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">No history found</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-40 scroll-smooth">
          <div className="mx-auto max-w-3xl pt-16 px-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
                <div className="size-16 mb-6 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl text-white">✨</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">How can I help you today?</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  Send a message to start a new conversation. I can answer questions, help you write code, or just chat.
                </p>
              </div>
            ) : (
              <MessageList messages={messages} userAvatar={prefs.avatar} loading={loading} />
            )}
            
            {error && (
              <div className="mt-4 mx-auto max-w-2xl rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent pt-10 pb-6 px-4 pointer-events-none">
          <div className="mx-auto max-w-3xl pointer-events-auto relative">
            <MessageInput 
              disabled={loading} 
              onSend={onSend} 
              onListeningStart={() => setRobotStatus("listening")}
              onListeningEnd={() => setRobotStatus("idle")}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

