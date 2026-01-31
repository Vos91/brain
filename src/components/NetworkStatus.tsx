"use client";

import { useState, useEffect } from "react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        px-4 py-2 rounded-full text-sm font-medium
        shadow-lg backdrop-blur-sm
        transition-all duration-300 animate-fade-in
        ${isOnline 
          ? "bg-emerald-500/90 text-white" 
          : "bg-rose-500/90 text-white"
        }
      `}
    >
      {isOnline ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Weer online
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full" />
          Geen internetverbinding
        </span>
      )}
    </div>
  );
}
