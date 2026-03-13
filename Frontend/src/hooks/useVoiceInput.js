import { useState, useRef, useCallback } from "react";

/**
 * Custom hook for Web Speech API voice input with multi-language support.
 *
 * FIX: Uses a ref to accumulate only FINAL transcripts, and exposes
 * interim text separately so it doesn't get re-appended on every event.
 */
const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "pt-BR", label: "Português" },
  { code: "ar-SA", label: "العربية" },
  { code: "zh-CN", label: "中文" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "mr-IN", label: "मराठी" },
  { code: "gu-IN", label: "ગુજરાતી" },
];

const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");       // finalized text only
  const [interimText, setInterimText] = useState("");      // live preview (temporary)
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const recognitionRef = useRef(null);
  const finalTextRef = useRef("");  // accumulates only final results

  const isSupported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startListening = useCallback(
    (lang = null) => {
      if (!isSupported) {
        setError("Voice input is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      setError(null);
      finalTextRef.current = "";  // reset for this session

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang || selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        // Rebuild the full transcript from ALL results every time.
        // This is the correct approach — the API gives us the full
        // result list, so we just re-scan it on each event.
        let allFinal = "";
        let currentInterim = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            allFinal += result[0].transcript + " ";
          } else {
            currentInterim += result[0].transcript;
          }
        }

        finalTextRef.current = allFinal.trim();
        setTranscript(allFinal.trim());
        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone permissions.");
        } else if (event.error === "no-speech") {
          setError("No speech detected. Please try speaking again.");
        } else {
          setError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");  // clear interim when done
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported, selectedLanguage]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimText("");
    finalTextRef.current = "";
  }, []);

  return {
    isListening,
    transcript,        // finalized words only — safe to use as final input
    interimText,       // live preview of what's being spoken right now
    error,
    isSupported,
    selectedLanguage,
    setSelectedLanguage,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
    languages: LANGUAGES,
  };
};

export default useVoiceInput;
