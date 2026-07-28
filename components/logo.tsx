import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-foreground shadow-sm transition-transform duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 h-5 w-5 text-background"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <polygon points="14,4 14,20 22,12" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {showText && (
        <span className="text-xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
          Repause
        </span>
      )}
    </div>
  );
}
