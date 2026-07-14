import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 transition-transform duration-300 hover:scale-110">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 h-5 w-5 text-white"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <polygon points="14,4 14,20 22,12" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {showText && (
        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent drop-shadow-sm">
          Repause
        </span>
      )}
    </div>
  );
}
