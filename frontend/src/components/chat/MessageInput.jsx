import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function MessageInput({ disabled, onSend, onListeningStart, onListeningEnd }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [isContinuous, setIsContinuous] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const SpeechRecognition = useMemo(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  const startVoice = () => {
    if (!SpeechRecognition) return;
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recog = new SpeechRecognition();
    recognitionRef.current = recog;
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart = () => {
      setIsListening(true);
      onListeningStart?.();
    };

    recog.onend = () => {
      setIsListening(false);
      onListeningEnd?.();
      
      // Auto-restart if in continuous mode
      if (isContinuous && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // ignore if already started
          }
        }, 300);
      }
    };

    recog.onresult = (e) => {
      const t0 = e.results?.[0]?.[0]?.transcript;
      if (t0) {
        setText((prev) => (prev ? `${prev} ${t0}` : t0));
        setTimeout(() => {
          submitWithText(t0);
        }, 500);
      }
    };
    
    try {
      recog.start();
    } catch (e) {}
  };

  useEffect(() => {
    // If continuous mode is toggled off, stop recognition
    if (!isContinuous && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isContinuous]);

  const submitWithText = (forceText) => {
    const v = forceText || text.trim();
    if (!v) return;
    onSend(v);
    setText("");
  };

  const submit = () => {
    submitWithText();
  };

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  return (
    <div className="relative group">
      <div className="absolute -top-10 right-2 z-10 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setIsContinuous(!isContinuous)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md border transition-all duration-300 shadow-sm ${
            isContinuous 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10' 
              : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-800'
          }`}
          title="Toggle Hands-Free Mode"
        >
          <span className={`w-2 h-2 rounded-full ${isContinuous ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
          Hands-Free
        </button>
      </div>

      <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/80 p-2 transition-all duration-300 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:shadow-[0_8px_30px_rgb(79,70,229,0.1)] focus-within:border-indigo-500/30">
        
        <div className="flex items-end gap-2 px-2 pb-1">
          <textarea
            ref={inputRef}
            className="w-full min-h-[44px] max-h-[200px] resize-none bg-transparent px-2 py-3 text-[15px] text-slate-800 dark:text-slate-100 outline-none transition-colors placeholder:text-slate-500/70"
            placeholder={t("placeholder")}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
                if (inputRef.current) {
                  inputRef.current.style.height = 'auto';
                }
              }
            }}
            disabled={disabled}
            rows={1}
          />
        </div>

        <div className="flex items-center justify-between px-2 pb-1 pt-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
              title="Attach File"
              disabled={disabled}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startVoice}
              className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                isListening
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 animate-pulse'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
              disabled={disabled || !SpeechRecognition}
              title={SpeechRecognition ? (isListening ? "Stop listening" : "Start voice input") : "Voice not supported"}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h.01M15 10h.01M12 14c0 1.1-.9 2-2 2s-2-.9-2-2m6 0c0 1.1-.9 2-2 2s-2-.9-2-2" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                submit();
                if (inputRef.current) inputRef.current.style.height = 'auto';
              }}
              className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                text.trim()
                  ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}
              disabled={disabled || !text.trim()}
              title={t("send")}
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

