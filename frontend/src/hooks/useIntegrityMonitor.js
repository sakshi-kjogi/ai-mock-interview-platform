import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_VIOLATIONS = 3;

export function useIntegrityMonitor({ enabled = true, onViolation, onMaxViolationsReached }) {
  const [violationCount, setViolationCount] = useState(0);
  const [isFullscreen, setIsFullscreen]     = useState(!!document.fullscreenElement);
  const countRef    = useRef(0);   // avoids stale closures inside event handlers
  const firedMaxRef  = useRef(false); // ensures onMaxViolationsReached fires exactly once

  const recordViolation = useCallback((type) => {
    countRef.current += 1;
    setViolationCount(countRef.current);
    onViolation?.(type, countRef.current);

    if (countRef.current >= MAX_VIOLATIONS && !firedMaxRef.current) {
      firedMaxRef.current = true;
      onMaxViolationsReached?.();
    }
  }, [onViolation, onMaxViolationsReached]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.error("Fullscreen request failed:", e);
    }
  }, []);

  const exitFullscreenIntentionally = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) recordViolation("fullscreen_exit");
    };

    const handleVisibility = () => {
      if (document.hidden) recordViolation("tab_switch");
    };

    // Tab switching triggers both visibilitychange AND blur in most browsers.
    // Only count blur as its own violation when the document is NOT hidden,
    // to avoid double-logging the same action.
    const handleBlur = () => {
      if (!document.hidden) recordViolation("window_blur");
    };

    const blockCopy = (e) => { e.preventDefault(); recordViolation("copy_attempt"); };
    const blockCut  = (e) => { e.preventDefault(); recordViolation("cut_attempt"); };
    const blockPaste = (e) => { e.preventDefault(); recordViolation("paste_attempt"); };
    const blockContextMenu = (e) => { e.preventDefault(); recordViolation("context_menu"); };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCut);
    document.addEventListener("paste", blockPaste);
    document.addEventListener("contextmenu", blockContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCut);
      document.removeEventListener("paste", blockPaste);
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, [enabled, recordViolation]);

  return {
    violationCount,
    maxViolations: MAX_VIOLATIONS,
    isFullscreen,
    requestFullscreen,
    exitFullscreenIntentionally,
  };
}