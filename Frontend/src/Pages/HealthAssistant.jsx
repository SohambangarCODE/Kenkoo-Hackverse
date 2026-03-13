import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import useVoiceInput from "../hooks/useVoiceInput";
import useFingerPPG from "../hooks/useFingerPPG";
import jsPDF from "jspdf";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
} from "recharts";
import {
  Bot, Sparkles, Mic, MicOff, Send, Brain, Activity,
  Heart, Thermometer, Stethoscope, Clock, Star,
  ChevronRight, ChevronLeft, Zap, Shield, MessageSquare,
  Upload, FileText, X, AlertTriangle, Phone,
  MapPin, Pill, User, Weight, Ruler, Plus,
  CheckCircle, Loader2, Globe, Volume2, Paperclip,
  Trash2, ArrowRight, ArrowLeft, RotateCcw, Download,
  Camera, Smartphone, Fingerprint, Square, Waves
} from "lucide-react";

/* ── Constants ─────────────────────────────────────────────────────── */
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = isLocal
  ? `http://${window.location.hostname}:3000/api`
  : "https://kenkoo-morpheus.onrender.com/api";

const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Cough", "Chest Pain", "Fatigue",
  "Nausea", "Dizziness", "Shortness of Breath", "Sore Throat",
  "Body Aches", "Vomiting", "Diarrhea", "Abdominal Pain",
  "Back Pain", "Joint Pain", "Skin Rash", "Runny Nose",
  "Loss of Appetite", "Insomnia", "Anxiety",
];

const PRE_CONDITIONS = [
  "Diabetes", "Hypertension", "Asthma", "Heart Disease",
  "Thyroid Disorder", "COPD", "Kidney Disease", "Liver Disease",
  "Cancer", "HIV/AIDS", "Arthritis", "Epilepsy",
  "Depression", "Obesity", "Anemia", "None",
];

const STEP_LABELS = [
  { icon: <Stethoscope className="w-4 h-4" />, label: "Symptoms" },
  { icon: <Activity className="w-4 h-4" />, label: "Vitals" },
  { icon: <User className="w-4 h-4" />, label: "History" },
  { icon: <Paperclip className="w-4 h-4" />, label: "Documents" },
];

const SEVERITY_CONFIG = {
  low:      { emoji: "🟢", label: "Low",      color: "text-green-600",  bg: "bg-green-50",    border: "border-green-200", barColor: "bg-green-500"  },
  moderate: { emoji: "🟡", label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50",   border: "border-yellow-200", barColor: "bg-yellow-500" },
  high:     { emoji: "🔴", label: "High",     color: "text-red-600",    bg: "bg-red-50",      border: "border-red-200", barColor: "bg-red-500"    },
  critical: { emoji: "🚨", label: "Critical", color: "text-red-700",    bg: "bg-red-100",     border: "border-red-400", barColor: "bg-red-700"    },
};

/* ── Animation ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: "easeOut" },
  }),
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
};

/* ── Main Component ────────────────────────────────────────────────── */
const HealthAssistant = () => {
  const { user } = useAuth();
  const voice = useVoiceInput();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Wizard state
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1: Symptoms
  const [symptoms, setSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // Step 2: Vitals
  const [vitals, setVitals] = useState({
    temperature: "", temperatureUnit: "F",
    systolic: "", diastolic: "",
    heartRate: "", spo2: "",
  });

  /* ── Auto-fill vitals from camera scan query params ────────────── */
  useEffect(() => {
    const hr   = searchParams.get("hr");
    const sp   = searchParams.get("spo2");
    const rr   = searchParams.get("rr");
    if (hr || sp) {
      setVitals(v => ({
        ...v,
        heartRate: hr || v.heartRate,
        spo2: sp || v.spo2,
      }));
      // Navigate to vitals step
      setStep(1);
      // Clean up query params
      setSearchParams({}, { replace: true });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Step 3: Medical History
  const [history, setHistory] = useState({
    age: "", gender: "", weight: "", height: "",
    conditions: [],
    medications: "", allergies: "",
  });

  // Step 4: Documents
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  /* ── Navigation ──────────────────────────────────────────────────── */
  const goNext = () => {
    if (step < 3) { setDirection(1); setStep(s => s + 1); }
  };
  const goBack = () => {
    if (step > 0) { setDirection(-1); setStep(s => s - 1); }
  };

  /* ── Voice input sync ────────────────────────────────────────────── */
  const toggleVoice = () => {
    if (voice.isListening) {
      voice.stopListening();
      // Append only the finalized transcript (no duplicates)
      const final = voice.transcript.trim();
      if (final) {
        setSymptoms(prev => prev + (prev ? " " : "") + final);
      }
      voice.resetTranscript();
    } else {
      voice.resetTranscript();
      voice.startListening();
    }
  };

  /* ── File handling ───────────────────────────────────────────────── */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    e.target.value = "";
  };
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Symptom chip toggle ─────────────────────────────────────────── */
  const toggleSymptom = (sym) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  /* ── Condition toggle ────────────────────────────────────────────── */
  const toggleCondition = (cond) => {
    if (cond === "None") {
      setHistory(h => ({ ...h, conditions: h.conditions.includes("None") ? [] : ["None"] }));
      return;
    }
    setHistory(h => ({
      ...h,
      conditions: h.conditions.includes(cond)
        ? h.conditions.filter(c => c !== cond)
        : [...h.conditions.filter(c => c !== "None"), cond],
    }));
  };

  /* ── Submit Analysis ─────────────────────────────────────────────── */
  const handleAnalyze = async () => {
    const allSymptoms = [
      symptoms.trim(),
      ...selectedSymptoms,
    ].filter(Boolean).join(", ");

    if (!allSymptoms) {
      setError("Please describe at least one symptom.");
      setStep(0);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("symptoms", allSymptoms);
      formData.append("vitals", JSON.stringify(vitals));
      formData.append("medicalHistory", JSON.stringify(history));
      formData.append("language", voice.languages.find(l => l.code === voice.selectedLanguage)?.label || "English");

      if (uploadedFiles.length > 0) {
        formData.append("file", uploadedFiles[0]);
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/assistant/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await res.json();
      setResults(data.analysis);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Reset ───────────────────────────────────────────────────────── */
  const handleReset = () => {
    setStep(0);
    setDirection(1);
    setSymptoms("");
    setSelectedSymptoms([]);
    setVitals({ temperature: "", temperatureUnit: "F", systolic: "", diastolic: "", heartRate: "", spo2: "" });
    setHistory({ age: "", gender: "", weight: "", height: "", conditions: [], medications: "", allergies: "" });
    setUploadedFiles([]);
    setResults(null);
    setError(null);
  };

  /* ── If results exist, show results page ─────────────────────────── */
  if (results) {
    const symptomsSummary = [
      symptoms.trim(),
      ...selectedSymptoms,
    ].filter(Boolean).join(", ");
    return <ResultsPanel results={results} onReset={handleReset} user={user} symptomsSummary={symptomsSummary} />;
  }

  /* ── Loading state ───────────────────────────────────────────────── */
  if (isAnalyzing) {
    return <AnalyzingScreen />;
  }

  /* ── Render Wizard ───────────────────────────────────────────────── */
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-8 pb-4 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="inline-flex items-center gap-2 bg-[#1447E6]/10 border border-[#1447E6]/20 text-[#1447E6] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Brain className="w-3.5 h-3.5" />
            AI Health Analyzer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Hello, {user?.name?.split(" ")[0] || "there"} 👋
            <br />
            <span className="bg-[#1447E6] bg-clip-text text-transparent">
              Let's Analyze Your Health
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-lg">
            Provide your symptoms, vitals, and medical history — our AI will analyze like a senior physician.
          </p>
        </motion.div>
      </div>

      {/* Step Indicator */}
      <div className="px-4 sm:px-6 max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-1 sm:gap-2">
          {STEP_LABELS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
              className="flex-1 flex items-center justify-center gap-1.5"
            >
              <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i === step
                  ? "bg-[#1447E6] text-white shadow-lg shadow-[#1447E6]/25"
                  : i < step
                  ? "bg-[#1447E6]/10 text-[#1447E6]"
                  : "bg-white text-slate-400 border border-slate-200"
              }`}>
                {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
              </span>
              <span className="hidden sm:inline text-xs font-bold text-slate-700">{s.label}</span>
              {i < 3 && <div className={`w-4 sm:w-8 h-0.5 rounded-full transition-all ${step > i + 1 ? 'bg-[#1447E6]' : 'bg-slate-200'}`} />}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[420px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-5 sm:p-8"
            >
              {step === 0 && (
                <StepSymptoms
                  symptoms={symptoms}
                  setSymptoms={setSymptoms}
                  selectedSymptoms={selectedSymptoms}
                  toggleSymptom={toggleSymptom}
                  voice={voice}
                  toggleVoice={toggleVoice}
                />
              )}
              {step === 1 && (
                <StepVitals vitals={vitals} setVitals={setVitals} />
              )}
              {step === 2 && (
                <StepHistory
                  history={history}
                  setHistory={setHistory}
                  toggleCondition={toggleCondition}
                />
              )}
              {step === 3 && (
                <StepDocuments
                  uploadedFiles={uploadedFiles}
                  handleFileSelect={handleFileSelect}
                  removeFile={removeFile}
                  fileInputRef={fileInputRef}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="px-5 sm:px-8 pb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-5 sm:px-8 pb-6 flex items-center justify-between gap-4">
            <button
              onClick={goBack}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1447E6] hover:bg-blue-700 shadow-lg shadow-[#1447E6]/25 transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1447E6] to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-[#1447E6]/25 transition-all"
              >
                <Brain className="w-4 h-4" /> Analyze Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   STEP 1: SYMPTOMS
   ══════════════════════════════════════════════════════════════════════ */
const StepSymptoms = ({ symptoms, setSymptoms, selectedSymptoms, toggleSymptom, voice, toggleVoice }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
        <Stethoscope className="w-5 h-5 text-[#1447E6]" /> Describe Your Symptoms
      </h2>
      <p className="text-sm text-slate-500">Type or use voice input in your preferred language.</p>
    </div>

    {/* Language selector + Voice button */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
        <Globe className="w-4 h-4 text-slate-400" />
        <select
          value={voice.selectedLanguage}
          onChange={(e) => voice.setSelectedLanguage(e.target.value)}
          className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
        >
          {voice.languages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={toggleVoice}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
          voice.isListening
            ? "bg-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse"
            : "bg-[#1447E6]/10 text-[#1447E6] hover:bg-[#1447E6]/20"
        }`}
      >
        {voice.isListening ? (
          <><MicOff className="w-4 h-4" /> Stop Listening</>
        ) : (
          <><Mic className="w-4 h-4" /> Voice Input</>
        )}
      </button>
    </div>

    {/* Voice status */}
    {voice.isListening && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <div className="flex gap-1">
          <span className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" />
          <span className="w-1.5 h-6 bg-red-400 rounded-full animate-pulse [animation-delay:100ms]" />
          <span className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:200ms]" />
          <span className="w-1.5 h-5 bg-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
          <span className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse [animation-delay:400ms]" />
        </div>
        <span className="text-sm text-red-700 font-medium">
          Listening... speak now in {voice.languages.find(l => l.code === voice.selectedLanguage)?.label}
        </span>
      </motion.div>
    )}

    {voice.error && (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl px-4 py-3">
        ⚠️ {voice.error}
      </div>
    )}

    {/* Live transcript preview */}
    {voice.isListening && (voice.transcript || voice.interimText) && (
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <span className="font-bold">Live: </span>
        {voice.transcript}
        {voice.interimText && (
          <span className="text-blue-400 italic"> {voice.interimText}</span>
        )}
      </div>
    )}

    {/* Textarea */}
    <textarea
      value={symptoms}
      onChange={(e) => setSymptoms(e.target.value)}
      placeholder="E.g., I've been having persistent headaches for 3 days, mild fever, and body aches. The headache is mostly in the front region and gets worse in the evening..."
      rows={5}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 resize-none transition-all"
    />

    {/* Quick symptom chips */}
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Select Common Symptoms</p>
      <div className="flex flex-wrap gap-2">
        {COMMON_SYMPTOMS.map((sym) => (
          <button
            key={sym}
            onClick={() => toggleSymptom(sym)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedSymptoms.includes(sym)
                ? "bg-[#1447E6] text-white shadow-md shadow-[#1447E6]/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   STEP 2: VITALS — mobile finger PPG + desktop face scan
   ══════════════════════════════════════════════════════════════════════ */
const StepVitals = ({ vitals, setVitals }) => {
  const updateVital = (key, value) => setVitals(v => ({ ...v, [key]: value }));
  const navigate = useNavigate();

  // Finger PPG hook (mobile only)
  const fingerVideoRef = useRef(null);
  const fingerCanvasRef = useRef(null);
  const finger = useFingerPPG();

  const handleStartFingerScan = useCallback(() => {
    setTimeout(() => {
      if (fingerVideoRef.current && fingerCanvasRef.current) {
        finger.startScan(fingerVideoRef.current, fingerCanvasRef.current);
      }
    }, 100);
  }, [finger]);

  // Auto-fill vitals when finger scan completes
  useEffect(() => {
    if (finger.scanComplete && finger.heartRate > 0) {
      setVitals(v => ({
        ...v,
        heartRate: finger.heartRate.toString(),
      }));
    }
  }, [finger.scanComplete, finger.heartRate, setVitals]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-[#1447E6]" /> Enter Your Vitals
        </h2>
        <p className="text-sm text-slate-500">
          {finger.isMobile
            ? "Scan your finger on the camera or enter vitals manually."
            : "Scan your face with the camera or enter vitals manually. All fields are optional."}
        </p>
      </div>

      {/* ───── MOBILE: Finger PPG Scanner ────────────────────────────── */}
      {finger.isMobile && (
        <>
          {/* Scan Complete Results Card */}
          {finger.scanComplete && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-bold text-emerald-800 text-sm">Finger Scan Complete — Results</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Heart Rate</p>
                  <p className="text-xl font-extrabold text-slate-900">{finger.heartRate} <span className="text-xs font-medium text-slate-400">BPM</span></p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">HRV (SDNN)</p>
                  <p className="text-xl font-extrabold text-slate-900">{finger.hrv} <span className="text-xs font-medium text-slate-400">ms</span></p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Stress Level</p>
                  <p className={`text-lg font-extrabold ${
                    finger.stressLevel === 'Low' ? 'text-green-600' :
                    finger.stressLevel === 'Moderate' ? 'text-amber-600' : 'text-red-600'
                  }`}>{finger.stressLevel}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Circulation</p>
                  <p className={`text-lg font-extrabold ${
                    finger.circulationQuality === 'Good' ? 'text-green-600' :
                    finger.circulationQuality === 'Fair' ? 'text-amber-600' : 'text-red-600'
                  }`}>{finger.circulationQuality}</p>
                </div>
              </div>
              {/* Waveform */}
              {finger.ppgWaveform.length > 5 && (
                <div className="bg-white rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">PPG Waveform</p>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={finger.ppgWaveform}>
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                        <XAxis dataKey="idx" hide />
                        <YAxis hide />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <button
                onClick={handleStartFingerScan}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-lg transition-colors w-full"
              >
                Re-scan
              </button>
            </div>
          )}

          {/* Active Scanning UI */}
          {finger.isScanning && (
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
              {/* Hidden video + canvas for capture */}
              <video ref={fingerVideoRef} className="hidden" autoPlay playsInline muted />
              <canvas ref={fingerCanvasRef} className="hidden" />

              <div className="p-6 text-center space-y-4">
                {/* Circular progress */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - finger.scanProgress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.3s' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white tabular-nums">{finger.scanProgress}%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Scanning</span>
                  </div>
                </div>

                {/* Finger detection status */}
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${finger.fingerDetected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-xs font-bold text-white/80">
                    {finger.fingerDetected ? '✓ Finger Detected — Hold Still' : '✗ Place finger on camera'}
                  </span>
                </div>

                {/* Live waveform preview */}
                {finger.ppgWaveform.length > 5 && (
                  <div className="h-20 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={finger.ppgWaveform}>
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                        <XAxis dataKey="idx" hide />
                        <YAxis hide />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Instruction */}
                <p className="text-[10px] text-slate-500">
                  Keep your finger firmly pressed. The flashlight illuminates blood flow.
                </p>

                <button
                  onClick={() => finger.stopScan()}
                  className="flex items-center justify-center gap-1.5 mx-auto px-4 py-2 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Square className="w-3 h-3" /> Stop Scan
                </button>
              </div>

              {/* Disclaimer */}
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
                <p className="text-[9px] text-amber-400 flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  Camera PPG is an estimate. Not a replacement for certified medical devices.
                </p>
              </div>
            </div>
          )}

          {/* Start Scan Button (mobile, when not scanning and not complete) */}
          {!finger.isScanning && !finger.scanComplete && (
            <>
              {/* Hidden video + canvas elements needed before scan starts */}
              <video ref={fingerVideoRef} className="hidden" autoPlay playsInline muted />
              <canvas ref={fingerCanvasRef} className="hidden" />

              <button
                onClick={handleStartFingerScan}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-white
                  bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 hover:from-rose-600 hover:via-pink-600 hover:to-red-600
                  shadow-lg shadow-rose-500/25 transition-all hover:shadow-rose-500/40 hover:-translate-y-0.5 active:scale-[0.99]
                  border border-rose-400/30"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <span className="block">👆 Finger Vital Scan</span>
                  <span className="block text-[10px] font-medium text-white/70">Place finger on camera + flashlight • 25 sec scan</span>
                </div>
                <Smartphone className="w-4 h-4 text-white/50" />
              </button>

              {/* Error */}
              {finger.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> {finger.error}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ───── DESKTOP: Face Scan Button ────────────────────────────── */}
      {!finger.isMobile && (
        <button
          onClick={() => navigate('/app/vitalscan')}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-white
            bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-600 hover:via-blue-600 hover:to-blue-600
            shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.99]
            border border-blue-400/30"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block">📷 Scan Vitals with Camera</span>
            <span className="block text-[10px] font-medium text-white/70">Uses rPPG / EVM to detect Heart Rate, SpO₂, Respiration from your face</span>
          </div>
        </button>
      )}

      {/* ───── Manual Vitals Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Temperature */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={vitals.temperature}
              onChange={(e) => updateVital("temperature", e.target.value)}
              placeholder={vitals.temperatureUnit === "F" ? "98.6" : "37.0"}
              className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <button
              onClick={() => updateVital("temperatureUnit", vitals.temperatureUnit === "F" ? "C" : "F")}
              className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              °{vitals.temperatureUnit}
            </button>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Blood Pressure</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={vitals.systolic}
              onChange={(e) => updateVital("systolic", e.target.value)}
              placeholder="120"
              className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <span className="text-slate-400 font-bold">/</span>
            <input
              type="number"
              value={vitals.diastolic}
              onChange={(e) => updateVital("diastolic", e.target.value)}
              placeholder="80"
              className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <span className="text-xs text-slate-500 font-medium">mmHg</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className={`bg-gradient-to-br from-blue-50 to-blue-50 border rounded-2xl p-4 sm:p-5 ${
          finger.scanComplete && finger.heartRate ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Heart Rate</span>
            {finger.scanComplete && finger.heartRate > 0 && (
              <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">👆 Scanned</span>
            )}
          </div>
          <input
            type="number"
            value={vitals.heartRate}
            onChange={(e) => updateVital("heartRate", e.target.value)}
            placeholder="72 BPM"
            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {/* SpO2 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">SpO₂ (Oxygen)</span>
          </div>
          <input
            type="number"
            value={vitals.spo2}
            onChange={(e) => updateVital("spo2", e.target.value)}
            placeholder="98%"
            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   STEP 3: MEDICAL HISTORY
   ══════════════════════════════════════════════════════════════════════ */
const StepHistory = ({ history, setHistory, toggleCondition }) => {
  const updateField = (key, value) => setHistory(h => ({ ...h, [key]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-[#1447E6]" /> Medical History & Demographics
        </h2>
        <p className="text-sm text-slate-500">Help us understand your background for more accurate analysis.</p>
      </div>

      {/* Demographics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Age</label>
          <input
            type="number"
            value={history.age}
            onChange={(e) => updateField("age", e.target.value)}
            placeholder="25"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1447E6]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Gender</label>
          <select
            value={history.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1447E6] cursor-pointer"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Weight (kg)</label>
          <input
            type="number"
            value={history.weight}
            onChange={(e) => updateField("weight", e.target.value)}
            placeholder="70"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1447E6]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Height (cm)</label>
          <input
            type="number"
            value={history.height}
            onChange={(e) => updateField("height", e.target.value)}
            placeholder="170"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1447E6]"
          />
        </div>
      </div>

      {/* Pre-existing conditions */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pre-existing Conditions</p>
        <div className="flex flex-wrap gap-2">
          {PRE_CONDITIONS.map((cond) => (
            <button
              key={cond}
              onClick={() => toggleCondition(cond)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                history.conditions.includes(cond)
                  ? cond === "None"
                    ? "bg-green-500 text-white"
                    : "bg-[#1447E6] text-white shadow-md shadow-[#1447E6]/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Current Medications</label>
          <textarea
            value={history.medications}
            onChange={(e) => updateField("medications", e.target.value)}
            placeholder="E.g., Metformin 500mg daily, Aspirin..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1447E6] resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Allergies</label>
          <textarea
            value={history.allergies}
            onChange={(e) => updateField("allergies", e.target.value)}
            placeholder="E.g., Penicillin, Peanuts, Latex..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1447E6] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   STEP 4: DOCUMENTS
   ══════════════════════════════════════════════════════════════════════ */
const StepDocuments = ({ uploadedFiles, handleFileSelect, removeFile, fileInputRef }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
        <Paperclip className="w-5 h-5 text-[#1447E6]" /> Upload Medical Documents
      </h2>
      <p className="text-sm text-slate-500">Optional — upload lab reports, prescriptions, or test results for deeper analysis.</p>
    </div>

    {/* Drop zone */}
    <div
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-slate-300 hover:border-[#1447E6] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-blue-50/30 group"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.csv,.txt"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
      <div className="w-14 h-14 bg-slate-100 group-hover:bg-[#1447E6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
        <Upload className="w-7 h-7 text-slate-400 group-hover:text-[#1447E6] transition-colors" />
      </div>
      <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
      <p className="text-xs text-slate-400 mt-1">PDF, Images, DOCX, CSV, TXT — Max 25MB</p>
    </div>

    {/* File list */}
    {uploadedFiles.length > 0 && (
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Files</p>
        {uploadedFiles.map((file, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <FileText className="w-5 h-5 text-[#1447E6] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeFile(i); }}
              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   ANALYZING SCREEN
   ══════════════════════════════════════════════════════════════════════ */
const AnalyzingScreen = () => (
  <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-md mx-auto px-6"
    >
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1447E6] to-violet-600 rounded-full animate-ping opacity-20" />
        <div className="absolute inset-2 bg-gradient-to-r from-[#1447E6] to-violet-600 rounded-full animate-pulse opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1447E6] to-violet-600 rounded-full flex items-center justify-center">
          <Brain className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Analyzing Your Health Data</h2>
      <p className="text-sm text-slate-500 leading-relaxed">
        Our AI is cross-referencing your symptoms, vitals, and medical history like a senior physician...
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 text-[#1447E6] animate-spin" />
        <span className="text-sm font-bold text-[#1447E6]">Processing...</span>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   RESULTS PANEL
   ══════════════════════════════════════════════════════════════════════ */
const ResultsPanel = ({ results, onReset, user, symptomsSummary }) => {
  const severity = SEVERITY_CONFIG[results.severity?.level] || SEVERITY_CONFIG.moderate;
  const isEmergency = results.is_emergency || results.severity?.level === "critical";
  const [reportSaved, setReportSaved] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const savedRef = useRef(false);

  /* ── Auto-save report to Records ────────────────────────────────── */
  useEffect(() => {
    if (savedRef.current) return; // prevent double-save in React StrictMode
    savedRef.current = true;
    saveReportToRecords();
  }, []); // runs once on mount

  const saveReportToRecords = async () => {
    try {
      setSavingReport(true);
      const doc = buildPDF();
      const pdfBase64 = doc.output("datauristring").split(",")[1]; // get base64 portion

      // Build a descriptive title
      const topDisease = results.possible_diseases?.[0]?.name || "General";
      const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const symptomShort = (symptomsSummary || "").split(",").slice(0, 3).map(s => s.trim()).filter(Boolean).join(", ");
      const title = `AI Health Analysis — ${symptomShort || topDisease} — ${dateStr}`;

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const baseUrl = isLocal
        ? `http://${window.location.hostname}:3000/api/records`
        : "https://kenkoo-morpheus.onrender.com/api/records";

      const token = localStorage.getItem("token");
      await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          type: "AI Report",
          provider: "Kenkoo AI Health Assistant",
          fileData: pdfBase64,
          fileMimeType: "application/pdf",
          fileType: "pdf",
          summary: results.summary || "",
          analysis: results,
        }),
      });

      setReportSaved(true);
    } catch (err) {
      console.error("Failed to auto-save report:", err);
    } finally {
      setSavingReport(false);
    }
  };

  /* ── PDF Builder (shared by download + auto-save) ────────────────── */
  const buildPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 15;

    const addPageIfNeeded = (spaceNeeded = 30) => {
      if (y + spaceNeeded > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 15;
      }
    };

    // ─── Manual table drawer (replaces autoTable) ───
    const drawTable = ({ headers, rows, headerColor = [20, 71, 230], colWidths, startY }) => {
      const tableWidth = pageWidth - margin * 2;
      const cellPadding = 3;
      const headerFontSize = 9;
      const bodyFontSize = 8;
      const numCols = headers.length;

      // Calculate column widths
      const widths = colWidths || headers.map(() => tableWidth / numCols);

      // Draw header row
      let curY = startY || y;
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(margin, curY, tableWidth, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(headerFontSize);
      doc.setFont("helvetica", "bold");
      let curX = margin;
      headers.forEach((h, i) => {
        doc.text(h, curX + cellPadding, curY + 5.5);
        curX += widths[i];
      });
      curY += 8;

      // Draw body rows
      doc.setFontSize(bodyFontSize);
      doc.setFont("helvetica", "normal");
      rows.forEach((row, rowIdx) => {
        // Calculate row height based on text wrapping
        let maxLines = 1;
        const cellTexts = row.map((cell, colIdx) => {
          const text = String(cell || "-");
          const lines = doc.splitTextToSize(text, widths[colIdx] - cellPadding * 2);
          if (lines.length > maxLines) maxLines = lines.length;
          return lines;
        });
        const rowHeight = Math.max(7, maxLines * 4.5 + 3);

        // Page break check
        if (curY + rowHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          curY = 15;
        }

        // Striped background
        if (rowIdx % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(margin, curY, tableWidth, rowHeight, "F");
        }

        // Cell text
        doc.setTextColor(60, 60, 60);
        curX = margin;
        cellTexts.forEach((lines, colIdx) => {
          doc.text(lines, curX + cellPadding, curY + 4.5);
          curX += widths[colIdx];
        });

        // Row border
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, curY + rowHeight, margin + tableWidth, curY + rowHeight);
        curY += rowHeight;
      });

      return curY; // return final Y position
    };

    // ─── Header ───
    doc.setFillColor(20, 71, 230);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Kenkoo Health Report", margin, 18);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 27);
    doc.text(`Patient: ${user?.name || "N/A"}`, pageWidth - margin - 60, 27);
    y = 45;

    // ─── Severity ───
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Severity Assessment", margin, y);
    y += 8;
    const sevLevel = results.severity?.level || "moderate";
    const sevColors = { low: [34,197,94], moderate: [234,179,8], high: [239,68,68], critical: [185,28,28] };
    const sevC = sevColors[sevLevel] || sevColors.moderate;
    doc.setFillColor(sevC[0], sevC[1], sevC[2]);
    doc.roundedRect(margin, y, 50, 10, 2, 2, "F");
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${sevLevel.toUpperCase()} (${results.severity?.score || "-"}/10)`, margin + 5, y + 7);
    y += 15;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (results.severity?.reasoning) {
      const lines = doc.splitTextToSize(results.severity.reasoning, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    }

    // ─── Summary ───
    if (results.summary) {
      addPageIfNeeded(25);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Summary", margin, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const sumLines = doc.splitTextToSize(results.summary, pageWidth - margin * 2);
      doc.text(sumLines, margin, y);
      y += sumLines.length * 5 + 8;
    }

    // ─── Predicted Conditions table ───
    if (results.possible_diseases?.length > 0) {
      addPageIfNeeded(40);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Predicted Conditions", margin, y);
      y += 8;
      y = drawTable({
        headers: ["Condition", "Probability", "ICD Code", "Description"],
        rows: results.possible_diseases.map(d => [
          d.name,
          `${d.probability}%`,
          d.icd_code || "-",
          d.description || "-",
        ]),
        colWidths: [40, 25, 25, pageWidth - margin * 2 - 90],
        startY: y,
      }) + 10;
    }

    // ─── Vitals Assessment ───
    if (results.vitals_assessment) {
      addPageIfNeeded(40);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Vitals Assessment", margin, y);
      y += 8;
      y = drawTable({
        headers: ["Vital", "Status"],
        rows: [
          ["Temperature", (results.vitals_assessment.temperature_status || "N/A").replace(/_/g, " ")],
          ["Blood Pressure", (results.vitals_assessment.bp_status || "N/A").replace(/_/g, " ")],
          ["Heart Rate", (results.vitals_assessment.heart_rate_status || "N/A").replace(/_/g, " ")],
          ["SpO2", (results.vitals_assessment.spo2_status || "N/A").replace(/_/g, " ")],
        ],
        startY: y,
      }) + 10;
      if (results.vitals_assessment.overall_vitals_concern) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        const vLines = doc.splitTextToSize(results.vitals_assessment.overall_vitals_concern, pageWidth - margin * 2);
        doc.text(vLines, margin, y);
        y += vLines.length * 5 + 8;
      }
    }

    // ─── Recommended Doctors ───
    if (results.recommended_specialties?.length > 0) {
      addPageIfNeeded(30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Recommended Specialists", margin, y);
      y += 8;
      y = drawTable({
        headers: ["Specialty", "Reason"],
        rows: results.recommended_specialties.map(s => [s.specialty, s.reason]),
        headerColor: [34, 197, 94],
        startY: y,
      }) + 10;
    }

    // ─── First Aid ───
    if (results.first_aid_instructions?.length > 0) {
      addPageIfNeeded(30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("First Aid Instructions", margin, y);
      y += 8;
      results.first_aid_instructions.forEach((aid, i) => {
        addPageIfNeeded(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text(`${i + 1}. ${aid.title}`, margin, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        const aLines = doc.splitTextToSize(aid.description, pageWidth - margin * 2 - 5);
        doc.text(aLines, margin + 5, y);
        y += aLines.length * 5 + 4;
      });
      y += 4;
    }

    // ─── Lifestyle Recommendations ───
    if (results.lifestyle_recommendations?.length > 0) {
      addPageIfNeeded(25);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Lifestyle Recommendations", margin, y);
      y += 8;
      results.lifestyle_recommendations.forEach((rec, i) => {
        addPageIfNeeded(12);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        const rLines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - margin * 2);
        doc.text(rLines, margin, y);
        y += rLines.length * 5 + 2;
      });
      y += 4;
    }

    // ─── When to Seek Help ───
    if (results.when_to_seek_help) {
      addPageIfNeeded(25);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("When to Seek Professional Help", margin, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const hLines = doc.splitTextToSize(results.when_to_seek_help, pageWidth - margin * 2);
      doc.text(hLines, margin, y);
      y += hLines.length * 5 + 8;
    }

    // ─── Footer ───
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pH = doc.internal.pageSize.getHeight();
      doc.setFillColor(245, 245, 250);
      doc.rect(0, pH - 15, pageWidth, 15, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text("Disclaimer: This AI report is for informational purposes only. Always consult a qualified healthcare professional.", margin, pH - 7);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pH - 7);
    }

    // Download
    const patientName = (user?.name || "Patient").replace(/\s+/g, "_");
    doc.save(`Kenkoo_Health_Report_${patientName}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      {/* Emergency Banner */}
      {isEmergency && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 text-white px-4 sm:px-6 py-4"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">🚨 EMERGENCY DETECTED</h3>
                <p className="text-red-100 text-xs sm:text-sm">{results.emergency_message || "Seek immediate medical attention!"}</p>
              </div>
            </div>
            <a
              href="tel:911"
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white text-red-600 font-extrabold px-6 py-3 rounded-xl shadow-lg hover:bg-red-50 transition-all sm:ml-auto"
            >
              <Phone className="w-5 h-5" /> Call Emergency (911)
            </a>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="px-4 sm:px-6 pt-8 pb-4 max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">Analysis Complete</h2>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={buildPDF}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex-1 sm:flex-initial"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={onReset}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-[#1447E6] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3ab8] transition-all flex-1 sm:flex-initial"
              >
                <RotateCcw className="w-4 h-4" /> New Analysis
              </button>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Your Health Analysis
          </h1>
          {results.summary && (
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl">{results.summary}</p>
          )}
        </motion.div>
      </div>

      <div className="px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
        {/* ── Severity Badge ───────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className={`${severity.bg} ${severity.border} border rounded-2xl p-5 sm:p-6`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-3xl sm:text-4xl">{severity.emoji}</div>
              <div className="flex-1">
                <h3 className={`text-lg sm:text-xl font-extrabold ${severity.color}`}>
                  Severity: {severity.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{results.severity?.reasoning}</p>
              </div>
              {results.severity?.score && (
                <div className="hidden sm:flex flex-col items-center">
                  <span className={`text-3xl font-black ${severity.color}`}>{results.severity.score}</span>
                  <span className="text-xs text-slate-400 font-bold">/10</span>
                </div>
              )}
            </div>
            {/* Severity bar */}
            <div className="mt-4 bg-white/70 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(results.severity?.score || 5) * 10}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full ${severity.barColor}`}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Predicted Diseases ────────────────────────────────────── */}
        {results.possible_diseases?.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-blue-50">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-600" />
                  🔬 Predicted Conditions
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.possible_diseases.map((disease, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-5 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{disease.name}</h4>
                          {disease.icd_code && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                              {disease.icd_code}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{disease.description}</p>
                      </div>
                      <span className="text-lg font-black text-[#1447E6] whitespace-nowrap">
                        {disease.probability}%
                      </span>
                    </div>
                    {/* Probability bar */}
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${disease.probability}%` }}
                        transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#1447E6] to-violet-500"
                      />
                    </div>
                    {/* Matching symptoms */}
                    {disease.matching_symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {disease.matching_symptoms.map((s, j) => (
                          <span key={j} className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Vitals Assessment ────────────────────────────────────── */}
        {results.vitals_assessment && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                📊 Vitals Assessment
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {[
                  { label: "Temperature", status: results.vitals_assessment.temperature_status, icon: <Thermometer className="w-4 h-4" /> },
                  { label: "Blood Pressure", status: results.vitals_assessment.bp_status, icon: <Heart className="w-4 h-4" /> },
                  { label: "Heart Rate", status: results.vitals_assessment.heart_rate_status, icon: <Zap className="w-4 h-4" /> },
                  { label: "SpO₂", status: results.vitals_assessment.spo2_status, icon: <Activity className="w-4 h-4" /> },
                ].map((v, i) => {
                  const isNormal = (v.status || "").toLowerCase().includes("normal") || !v.status;
                  return (
                    <div key={i} className={`${isNormal ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"} border rounded-xl p-3 text-center`}>
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-1 ${isNormal ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                        {v.icon}
                      </div>
                      <p className="text-xs font-bold text-slate-700">{v.label}</p>
                      <p className={`text-[11px] font-semibold capitalize mt-0.5 ${isNormal ? "text-green-600" : "text-yellow-600"}`}>
                        {(v.status || "N/A").replace(/_/g, " ")}
                      </p>
                    </div>
                  );
                })}
              </div>
              {results.vitals_assessment.overall_vitals_concern && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
                  {results.vitals_assessment.overall_vitals_concern}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Doctor Recommendations + Nearby Clinics (side by side) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Doctor Specialties */}
          {results.recommended_specialties?.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6 h-full">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                  👨‍⚕️ Recommended Doctors
                </h3>
                <div className="space-y-3">
                  {results.recommended_specialties.map((doc, i) => (
                    <div key={i} className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{doc.specialty}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Nearby Clinics */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6 h-full">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-500" />
                🏥 Find Nearby Clinics
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Find hospitals and clinics near you for immediate consultation.
              </p>
              <div className="space-y-3">
                <a
                  href={`https://www.google.com/maps/search/hospital+near+me`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-800">Search Hospitals Near Me</p>
                    <p className="text-xs text-blue-500">Opens Google Maps</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </a>
                <a
                  href={`https://www.google.com/maps/search/clinic+near+me`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800">Search Clinics Near Me</p>
                    <p className="text-xs text-green-500">Opens Google Maps</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-green-400" />
                </a>
                <a
                  href={`https://www.google.com/maps/search/pharmacy+near+me`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 hover:bg-violet-100 transition-colors"
                >
                  <Pill className="w-5 h-5 text-violet-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-violet-800">Search Pharmacies Near Me</p>
                    <p className="text-xs text-violet-500">Opens Google Maps</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-violet-400" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── First Aid Instructions ───────────────────────────────── */}
        {results.first_aid_instructions?.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-600" />
                🩹 First Aid Instructions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.first_aid_instructions.map((aid, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-extrabold flex-shrink-0 text-base sm:text-lg">
                      {aid.icon || aid.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{aid.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{aid.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Lifestyle Recommendations ────────────────────────────── */}
        {results.lifestyle_recommendations?.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-6">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                💡 Lifestyle Recommendations
              </h3>
              <div className="space-y-2">
                {results.lifestyle_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── When to Seek Help ────────────────────────────────────── */}
        {results.when_to_seek_help && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
            <div className="bg-gradient-to-r from-[#1447E6] to-violet-600 rounded-2xl p-5 sm:p-6 text-white">
              <h3 className="font-extrabold flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                ⏰ When to Seek Professional Help
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">{results.when_to_seek_help}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HealthAssistant;
