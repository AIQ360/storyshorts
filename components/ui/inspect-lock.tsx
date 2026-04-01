"use client";

import { useEffect } from "react";

export function InspectLock() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") return;

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block common DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }

      // Ctrl+Shift+I or Cmd+Option+I (Inspect)
      // Ctrl+Shift+J or Cmd+Option+J (Console)
      // Ctrl+Shift+C or Cmd+Option+C (Element Selection)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "i" ||
          e.key === "J" ||
          e.key === "j" ||
          e.key === "C" ||
          e.key === "c")
      ) {
        e.preventDefault();
      }

      // Ctrl+U or Cmd+Option+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Aggressive lock: Infinite debugger trap (only runs in production to save your local dev experience)
    let trap: NodeJS.Timeout;
    if (process.env.NODE_ENV === "production") {
      trap = setInterval(() => {
        // eslint-disable-next-line no-debugger
        debugger;
      }, 50);
    }

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      if (trap) clearInterval(trap);
    };
  }, []);

  return null;
}
