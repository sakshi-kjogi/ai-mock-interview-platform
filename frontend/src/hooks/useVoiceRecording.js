import { useCallback, useEffect, useRef, useState } from "react";

// Safari uses the webkit prefix; Chrome/Edge use the standard name.
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoiceRecording({ onTranscript }) {
  const [isRecording, setIsRecording]   = useState(false);
  const [isSupported, setIsSupported]   = useState(false);
  const [interimText, setInterimText]   = useState("");
  const recognitionRef                  = useRef(null);
  // Tracks whether the USER wants recording on, separate from whether the
  // browser's underlying session is currently alive. Chrome's Web Speech API
  // fires "no-speech" + "end" after a few seconds of silence even with
  // continuous=true — that's a browser quirk, not the user stopping. When
  // that happens we auto-restart instead of treating it as a real stop.
  const shouldBeRecordingRef            = useRef(false);

  useEffect(() => {
    setIsSupported(!!SpeechRecognition);
  }, []);

  const createRecognition = useCallback(() => {
    const recognition = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final   = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text + " ";
        } else {
          interim += text;
        }
      }

      setInterimText(interim);

      if (final) {
        onTranscript(final.trim());
        setInterimText("");
      }
    };

    recognition.onerror = (e) => {
      // "no-speech" is expected/frequent (silence before the user starts
      // talking, or a pause mid-answer) — don't treat it as fatal.
      // Genuinely fatal errors (mic blocked, hardware issue) do stop us.
      if (e.error === "no-speech" || e.error === "aborted") {
        return; // let onend decide whether to restart
      }
      console.error("Speech recognition error:", e.error);
      shouldBeRecordingRef.current = false;
      setIsRecording(false);
      setInterimText("");
    };

    recognition.onend = () => {
      if (shouldBeRecordingRef.current) {
        // Browser ended the session on its own (timeout) but the user still
        // wants to be recording — restart transparently, no UI flicker.
        try {
          recognition.start();
        } catch {
          // If restart fails (rare — e.g. rapid stop/start race), fall back
          // to a clean stopped state rather than getting stuck.
          shouldBeRecordingRef.current = false;
          setIsRecording(false);
          setInterimText("");
        }
      } else {
        setIsRecording(false);
        setInterimText("");
      }
    };

    return recognition;
  }, [onTranscript]);

  const stop = useCallback(() => {
    shouldBeRecordingRef.current = false;
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterimText("");
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;
    shouldBeRecordingRef.current = true;
    const recognition = createRecognition();
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [createRecognition]);

  const toggle = useCallback(() => {
    isRecording ? stop() : start();
  }, [isRecording, start, stop]);

  // Stop microphone when the component using this hook unmounts
  useEffect(() => {
    return () => {
      shouldBeRecordingRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return { isRecording, isSupported, interimText, toggle, stop };
}