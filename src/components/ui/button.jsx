import React from "react";
export function Button({ className = "", variant, ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 font-bold transition disabled:opacity-50";
  const style = variant === "ghost" ? "bg-transparent hover:bg-white/10" : variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-white/10 hover:bg-white/20 text-white";
  return <button className={`${base} ${style} ${className}`} {...props} />;
}
