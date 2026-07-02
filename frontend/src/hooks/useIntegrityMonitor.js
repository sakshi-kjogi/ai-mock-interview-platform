import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_VIOLATIONS = 3;

export function useIntegrityMonitor({ enabled = true, onViolation, onMaxViolationsReached }) {
  const [violationCount, setViolationCount] = useState(0);
  const [isFullscreen,   setIsFullscreen]   = useState(!!document.fullscreenElement);

  // Refs ensure event listeners always see the latest values without
  // needing to be re-registered when props or state change.
  const countRef      = useRef(0);
  const firedMaxRef   = useRef(false);
  const onViolationRef     = useRef(onViolation);
  const onMaxReachedRef    = useRef(onMaxViolationsReached);

  useEffect(() => { onViolationRef.current  = onViolation; },     [onViolation]);
  useEffect(() => { onMaxReachedRef.current = onMaxViolationsReached; }, [onMaxViolationsReached]);

  const recordViolation = useCallback((type) => {
    countRef.current += 1;
    setViolationCount(countRef.current);
    onViolationRef.current?.(type, countRef.current);

    if (countRef.current >= MAX_VIOLATIONS && !firedMaxRef.current) {
      firedMaxRef.current = true;
      onMaxReachedRef.current?.();
    }
  }, []); // stable — reads from refs, never stale

  const requestFullscreen = useCallback(async () => {
    try { await document.documentElement.requestFullscreen(); }
    catch (e) { console.error("Fullscreen request failed:", e); }
  }, []);

  const exitFullscreenIntentionally = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onFullscreen   = () => { const fs = !!document.fullscreenElement; setIsFullscreen(fs); if (!fs) recordViolation("fullscreen_exit"); };
    const onVisibility   = () => { if (document.hidden) recordViolation("tab_switch"); };
    const onBlur         = () => { if (!document.hidden) recordViolation("window_blur"); };
    const onCopy         = (e) => { e.preventDefault(); recordViolation("copy_attempt"); };
    const onCut          = (e) => { e.preventDefault(); recordViolation("cut_attempt"); };
    const onPaste        = (e) => { e.preventDefault(); recordViolation("paste_attempt"); };
    const onContextMenu  = (e) => { e.preventDefault(); recordViolation("context_menu"); };

    document.addEventListener("fullscreenchange",  onFullscreen);
    document.addEventListener("visibilitychange",  onVisibility);
    window.addEventListener("blur",                onBlur);
    document.addEventListener("copy",              onCopy);
    document.addEventListener("cut",               onCut);
    document.addEventListener("paste",             onPaste);
    document.addEventListener("contextmenu",       onContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange",  onFullscreen);
      document.removeEventListener("visibilitychange",  onVisibility);
      window.removeEventListener("blur",                onBlur);
      document.removeEventListener("copy",              onCopy);
      document.removeEventListener("cut",               onCut);
      document.removeEventListener("paste",             onPaste);
      document.removeEventListener("contextmenu",       onContextMenu);
    };
  }, [enabled, recordViolation]);

  return { violationCount, maxViolations: MAX_VIOLATIONS, isFullscreen, requestFullscreen, exitFullscreenIntentionally };
}