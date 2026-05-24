import React from "react";

export function Button({ className = "", variant = "default", children, ...props }) {
  const variants = {
    default: "bg-white/10 text-white hover:bg-white/20",
    ghost: "bg-transparent text-white hover:bg-white/10",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 font-bold transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
