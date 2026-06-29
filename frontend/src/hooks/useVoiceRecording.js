import { useCallback, useEffect, useRef, useState } from "react";

// Safari uses the webkit prefix; Chrome/Edge use the standard name.
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoiceRecording({ onTranscript }) {
  const [isRecording, setIsRecording]   = useState(false);
  const [isSupported, setIsSupported]   = useState(false);
  const [interimText, setInterimText]   = useState("");
  const recognitionRef                  = useRef(null);

  useEffect(() => {
    setIsSupported(!!SpeechRecognition);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterimText("");
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous     = true;   // keep listening until explicitly stopped
    recognition.interimResults = true;   // stream partial results as the user speaks
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

      // Show live partial result below textarea
      setInterimText(interim);

      // Append confirmed text to the answer field
      if (final) {
        onTranscript(final.trim());
        setInterimText("");
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsRecording(false);
      setInterimText("");
    };

    // Browser ended the session (timeout, tab switch, etc.)
    recognition.onend = () => {
      setIsRecording(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [onTranscript]);

  const toggle = useCallback(() => {
    isRecording ? stop() : start();
  }, [isRecording, start, stop]);

  // Stop microphone when the component using this hook unmounts
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  return { isRecording, isSupported, interimText, toggle, stop };
}