export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 w-full py-2 px-1">
      <div className="flex items-center gap-1.5 h-8">
        <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600 [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600 [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300 dark:bg-slate-600"></div>
      </div>
    </div>
  );
}
