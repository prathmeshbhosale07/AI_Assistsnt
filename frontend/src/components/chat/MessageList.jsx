import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import TypingIndicator from "./TypingIndicator.jsx";

export default function MessageList({ messages, userAvatar, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col gap-6 pb-4">
      {messages.map((m, idx) => (
        <div
          key={idx}
          className={`flex gap-4 group ${
            m.role === "user" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="flex-shrink-0 mt-1">
            {m.role === "assistant" ? (
              <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">✨</span>
              </div>
            ) : (
              <img
                src={`/avatars/${userAvatar || "robot"}.png`}
                alt="user"
                className="size-8 rounded-full object-cover shadow-sm"
              />
            )}
          </div>

          <div
            className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-5 py-3.5 text-[15px] leading-relaxed relative ${
                m.role === "user"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl rounded-tr-sm"
                  : "text-slate-800 dark:text-slate-100"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="rounded-md overflow-hidden my-3 -mx-4 sm:mx-0 shadow-sm">
                            <div className="bg-slate-800 text-slate-300 text-xs px-4 py-1.5 flex justify-between select-none">
                              <span>{match[1]}</span>
                            </div>
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, "")}
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              className="!m-0 text-[13px]"
                            />
                          </div>
                        ) : (
                          <code
                            {...props}
                            className={`${className || ""} bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[13px]`}
                          >
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 mb-2">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 mb-2">{children}</ol>;
                      },
                      li({ children }) {
                        return <li className="mb-1">{children}</li>;
                      },
                      a({ children, href }) {
                        return <a href={href} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">{children}</a>;
                      }
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
            {m.role === "assistant" && (
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Copy">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs">✨</span>
            </div>
          </div>
          <TypingIndicator />
        </div>
      )}
      <div ref={bottomRef} className="h-4 flex-shrink-0" />
    </div>
  );
}
