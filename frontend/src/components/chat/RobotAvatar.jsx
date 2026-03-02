import React from "react";

/**
 * RobotAvatar Component
 * @param {string} status - 'idle', 'listening', or 'speaking'
 */
export default function RobotAvatar({ status = "idle" }) {
  // Styles based on the status
  const baseOuter = "relative flex items-center justify-center rounded-full transition-all duration-500";
  const baseInner = "rounded-full bg-gradient-to-br transition-all duration-500 shadow-[0_0_40px_rgba(79,70,229,0.4)] border border-white/20 backdrop-blur-md";

  let outerClasses = "";
  let innerClasses = "";
  let ringsClasses = "";

  if (status === "idle") {
    outerClasses = "w-28 h-28 bg-slate-200/50 dark:bg-slate-800/30";
    innerClasses = "w-16 h-16 from-indigo-500 to-purple-600";
    ringsClasses = "hidden";
  } else if (status === "listening") {
    // Pulse animation for listening
    outerClasses = "w-32 h-32 bg-emerald-100/50 dark:bg-emerald-900/30 animate-pulse";
    innerClasses = "w-16 h-16 from-emerald-400 to-teal-500 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.3)] dark:shadow-[0_0_50px_rgba(16,185,129,0.6)]";
    ringsClasses = "absolute inset-0 rounded-full border-2 border-emerald-400/80 dark:border-emerald-400/50 animate-ping";
  } else if (status === "speaking") {
    // Bounce/wave animation for speaking
    outerClasses = "w-32 h-32 bg-indigo-100/50 dark:bg-indigo-900/30";
    innerClasses = "w-16 h-16 from-indigo-400 to-purple-500 animate-bounce shadow-[0_0_50px_rgba(99,102,241,0.3)] dark:shadow-[0_0_50px_rgba(99,102,241,0.6)]";
    ringsClasses = "absolute inset-0 flex items-center justify-center gap-1.5";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${baseOuter} ${outerClasses}`}>
        {/* Helper rings or waves */}
        {status === "listening" && <div className={ringsClasses}></div>}
        
        {status === "speaking" && (
          <div className={ringsClasses}>
            <div className="w-1.5 h-6 bg-indigo-500/80 dark:bg-indigo-400/80 rounded-full animate-wave" style={{ animationDelay: '0s' }}></div>
            <div className="w-1.5 h-10 bg-indigo-500/80 dark:bg-indigo-400/80 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-14 bg-indigo-500/80 dark:bg-indigo-400/80 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-1.5 h-10 bg-indigo-500/80 dark:bg-indigo-400/80 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-6 bg-indigo-500/80 dark:bg-indigo-400/80 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></div>
          </div>
        )}

        {/* The core 'orb' or 'eye' */}
        <div className={`${baseInner} ${innerClasses} flex items-center justify-center z-10`}>
          {/* A small reflection to make it look glassy */}
          <div className="absolute top-2 left-3 w-4 h-2 bg-white/30 rounded-full rotate-[-45deg]"></div>
        </div>
      </div>
      
      <div className="mt-3 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase">
        {status === "idle" && "Ready"}
        {status === "listening" && <span className="text-emerald-600 dark:text-emerald-400">Listening...</span>}
        {status === "speaking" && <span className="text-indigo-600 dark:text-indigo-400">Speaking</span>}
      </div>
    </div>
  );
}
