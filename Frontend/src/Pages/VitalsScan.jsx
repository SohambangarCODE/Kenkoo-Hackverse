import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Camera, Heart, Activity, Wind, Zap, Shield, AlertTriangle,
  Play, Square, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff,
  RefreshCw, MonitorSmartphone, Waves,
} from "lucide-react";
import useVitalsDetection from "../hooks/useVitalsDetection";

/* ── Animations ────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: "easeOut" },
  }),
};

/* ── Vital Card ────────────────────────────────────────────────────── */
const VitalCard = ({ icon, label, value, unit, gradientFrom, gradientTo, borderColor, status, delay = 0 }) => {
  const statusMap = {
    normal:   { text: "Normal",   bg: "bg-green-50",  color: "text-green-700", border: "border-green-200" },
    warning:  { text: "Warning",  bg: "bg-amber-50",  color: "text-amber-700", border: "border-amber-200" },
    critical: { text: "Critical", bg: "bg-red-50",    color: "text-red-700",   border: "border-red-200" },
    waiting:  { text: "Waiting",  bg: "bg-slate-50",  color: "text-slate-500", border: "border-slate-200" },
  };
  const s = statusMap[status] || statusMap.waiting;

  return (
    <motion.div
      initial="hidden" animate="visible" variants={fadeUp} custom={delay}
      className={`bg-white rounded-2xl border ${borderColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.color} ${s.border}`}>
            {s.text}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums"
          >
            {value || "—"}
          </motion.span>
          <span className="text-xs font-semibold text-slate-400">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Waveform Card (PPG / Breathing raw signal) ────────────────────── */
const WaveformCard = ({ title, data, stroke, gradientId, icon, emptyMsg }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">{icon}</div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Waveform</span>
    </div>
    <div className="h-28 sm:h-32">
      {data.length > 5 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.2} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <YAxis domain={["auto", "auto"]} hide />
            <Line
              type="monotone" dataKey="value" stroke={stroke} strokeWidth={2}
              dot={false} isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-sm text-slate-400">{emptyMsg}</div>
      )}
    </div>
  </div>
);

/* ── Trend Graph Card ──────────────────────────────────────────────── */
const TrendCard = ({ title, data, stroke, gradientId, unit, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">{icon}</div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <span className="ml-auto text-[10px] text-slate-400">{unit}</span>
    </div>
    <div className="h-32 sm:h-36">
      {data.length > 2 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.25} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} interval="preserveStartEnd" />
            <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} width={32} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }} />
            <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2.5} fillOpacity={1} fill={`url(#${gradientId})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-sm text-slate-400">Collecting data...</div>
      )}
    </div>
  </div>
);

/* ── Calibration Overlay ───────────────────────────────────────────── */
const CalibrationOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl"
  >
    <div className="text-center px-6">
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#1447E6] to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
      >
        <Camera className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-lg font-extrabold text-white mb-2">Calibrating Sensor...</h3>
      <p className="text-sm text-white/70 max-w-xs mx-auto">
        Position your face in the centre. Stay still with good lighting.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        <span className="text-xs font-bold text-blue-300">Detecting skin colour changes...</span>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
const VitalsScan = () => {
  const navigate = useNavigate();
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [showEVM, setShowEVM] = useState(false);

  const {
    heartRate, spo2, respirationRate, pulseCount,
    signalQuality, isCalibrating, isScanning, error, faceDetected,
    ppgWaveform, breathWaveform,
    heartRateHistory, spo2History, respirationHistory,
    startScanning, stopScanning,
  } = useVitalsDetection();

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      startScanning(videoRef.current, canvasRef.current);
    }
    return () => stopScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    if (videoRef.current && canvasRef.current) startScanning(videoRef.current, canvasRef.current);
  };

  const handleUseReadings = () => {
    const p = new URLSearchParams({
      hr: heartRate.toString(), spo2: spo2.toString(),
      rr: respirationRate.toString(), pulse: pulseCount.toString(),
    });
    navigate(`/app/personalassistant?${p.toString()}`);
  };

  // Status helpers
  const hrStatus   = heartRate === 0 ? "waiting" : heartRate >= 60 && heartRate <= 100 ? "normal" : heartRate > 120 || heartRate < 50 ? "critical" : "warning";
  const spo2Status = spo2 === 0 ? "waiting" : spo2 >= 95 ? "normal" : spo2 >= 90 ? "warning" : "critical";
  const rrStatus   = respirationRate === 0 ? "waiting" : respirationRate >= 12 && respirationRate <= 20 ? "normal" : respirationRate > 25 || respirationRate < 8 ? "critical" : "warning";
  const pulseStatus = pulseCount === 0 ? "waiting" : "normal";
  const qualityPct = Math.min(100, signalQuality);
  const qualityLabel = qualityPct >= 70 ? "Excellent" : qualityPct >= 40 ? "Good" : qualityPct > 10 ? "Fair" : "No Signal";
  const qualityColor = qualityPct >= 70 ? "bg-green-500" : qualityPct >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-8 pb-4 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app/personalassistant")}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#1447E6]/10 border border-[#1447E6]/20 text-[#1447E6] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                  <MonitorSmartphone className="w-3 h-3" /> Eulerian Video Magnification
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Camera Vital Signs Monitor
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-lg">
                  Non-invasive, contactless health monitoring using rPPG computer vision to detect subtle skin colour changes caused by blood flow.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowEVM(!showEVM)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  showEVM
                    ? "bg-[#1447E6] text-white border-[#1447E6] shadow-lg shadow-[#1447E6]/25"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {showEVM ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showEVM ? "Raw Feed" : "EVM View"}
              </button>
              {isScanning ? (
                <button onClick={stopScanning}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all border border-red-400"
                >
                  <Square className="w-3.5 h-3.5" /> Stop
                </button>
              ) : (
                <button onClick={handleStart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1447E6] text-white hover:bg-blue-700 shadow-lg shadow-[#1447E6]/25 transition-all border border-blue-500"
                >
                  <Play className="w-3.5 h-3.5" /> Start Scan
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 sm:px-6 max-w-7xl mx-auto mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium flex-1">{error}</p>
            <button onClick={handleStart} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 max-w-7xl mx-auto space-y-5">

        {/* ── Row 1: Video + Vital Cards ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Video Feed */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white"
            >
              {/* Raw video */}
              <video ref={videoRef}
                className={`w-full aspect-[4/3] object-cover bg-slate-100 ${showEVM ? "hidden" : ""}`}
                autoPlay playsInline muted
              />
              {/* EVM-amplified canvas */}
              <canvas ref={canvasRef}
                className={`w-full aspect-[4/3] object-cover bg-slate-100 ${showEVM ? "" : "hidden"}`}
              />

              {/* ROI overlay */}
              {isScanning && !isCalibrating && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute border-2 border-dashed rounded-lg"
                    style={{
                      left: "25%", top: "15%", width: "50%", height: "45%",
                      borderColor: faceDetected ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)",
                    }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-black/40 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                      {faceDetected ? "✓ Skin Region Detected" : "✗ No Face Detected"}
                    </span>
                  </div>
                  {heartRate > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 60 / Math.max(40, heartRate), repeat: Infinity }}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg"
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              )}

              <AnimatePresence>{isCalibrating && <CalibrationOverlay />}</AnimatePresence>

              {!isScanning && (
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Camera Off</p>
                    <button onClick={handleStart}
                      className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1447E6] text-white hover:bg-blue-700 mx-auto shadow-lg transition-all"
                    >
                      <Play className="w-4 h-4" /> Start Scanning
                    </button>
                  </div>
                </div>
              )}

              {/* Mode label */}
              <div className="absolute top-3 left-3 z-10">
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${
                  showEVM ? "bg-[#1447E6] text-white" : "bg-white/80 text-slate-600 border border-slate-200"
                }`}>
                  {showEVM ? "EVM Amplified" : "Raw Feed"}
                </span>
              </div>
            </motion.div>

            {/* Signal Quality */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1447E6]" />
                  <span className="text-xs font-bold text-slate-700">Signal Quality</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  qualityPct >= 70 ? "bg-green-50 text-green-700 border border-green-200" :
                  qualityPct >= 40 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {qualityLabel} ({qualityPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${qualityPct}%` }} transition={{ duration: 0.6 }}
                  className={`h-full rounded-full ${qualityColor}`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                💡 Ensure good frontal lighting, keep face centred, and remain still for best results.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <p className="text-[10px] text-amber-700 leading-relaxed flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span><strong>Medical Disclaimer:</strong> Camera-based readings are estimates and must NOT replace certified medical devices. Always consult a healthcare professional for accurate diagnostics.</span>
              </p>
            </div>
          </div>

          {/* Vital Cards + Waveforms */}
          <div className="lg:col-span-7 space-y-5">

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <VitalCard icon={<Heart className="w-4 h-4" />} label="Heart Rate" value={heartRate} unit="BPM"
                gradientFrom="from-red-500" gradientTo="to-rose-500" borderColor="border-red-100" status={hrStatus} delay={1} />
              <VitalCard icon={<Activity className="w-4 h-4" />} label="SpO₂" value={spo2} unit="%"
                gradientFrom="from-cyan-500" gradientTo="to-blue-500" borderColor="border-cyan-100" status={spo2Status} delay={1.5} />
              <VitalCard icon={<Wind className="w-4 h-4" />} label="Respiration" value={respirationRate} unit="br/min"
                gradientFrom="from-emerald-500" gradientTo="to-teal-500" borderColor="border-emerald-100" status={rrStatus} delay={2} />
              <VitalCard icon={<Zap className="w-4 h-4" />} label="Pulse Count" value={pulseCount} unit="beats"
                gradientFrom="from-violet-500" gradientTo="to-purple-500" borderColor="border-violet-100" status={pulseStatus} delay={2.5} />
            </div>

            {/* Live Waveforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WaveformCard
                title="PPG Waveform (Cardiac)"
                data={ppgWaveform}
                stroke="#EF4444"
                gradientId="ppgWf"
                icon={<Heart className="w-3.5 h-3.5 text-red-500" />}
                emptyMsg="Waiting for cardiac signal..."
              />
              <WaveformCard
                title="Breathing Waveform"
                data={breathWaveform}
                stroke="#10B981"
                gradientId="brWf"
                icon={<Wind className="w-3.5 h-3.5 text-emerald-500" />}
                emptyMsg="Waiting for respiratory signal..."
              />
            </div>

            {/* Trend Graphs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TrendCard title="Heart Rate Trend" data={heartRateHistory} stroke="#EF4444" gradientId="hrTrend" unit="BPM"
                icon={<Heart className="w-3.5 h-3.5 text-red-500" />} />
              <TrendCard title="SpO₂ Trend" data={spo2History} stroke="#06B6D4" gradientId="spo2Trend" unit="%"
                icon={<Activity className="w-3.5 h-3.5 text-cyan-500" />} />
              <TrendCard title="Respiration Trend" data={respirationHistory} stroke="#10B981" gradientId="rrTrend" unit="br/min"
                icon={<Wind className="w-3.5 h-3.5 text-emerald-500" />} />
            </div>

            {/* Use Readings Button */}
            {heartRate > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <button onClick={handleUseReadings}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-extrabold text-white
                    bg-gradient-to-r from-[#1447E6] to-violet-600 hover:from-blue-700 hover:to-violet-700
                    shadow-lg shadow-[#1447E6]/25 transition-all hover:shadow-[#1447E6]/40 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <CheckCircle className="w-5 h-5" />
                  Use These Readings in Diagnosis
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── How It Works ────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 mb-4">
              <Waves className="w-5 h-5 text-[#1447E6]" />
              How EVM / rPPG Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Skin Isolation", desc: "YCrCb colour-space thresholding identifies skin pixels in each frame, ignoring background." },
                { step: "2", title: "Temporal Filtering", desc: "IIR Butterworth bandpass filters isolate cardiac (0.75–3.5 Hz) and respiratory (0.1–0.5 Hz) bands." },
                { step: "3", title: "Noise Rejection", desc: "Detrending removes slow lighting drift. Motion artifacts exceeding luminance thresholds are flagged." },
                { step: "4", title: "FFT Analysis", desc: "Hanning-windowed FFT on the filtered green-channel signal extracts dominant frequency → BPM." },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1447E6]/10 text-[#1447E6] flex items-center justify-center text-sm font-extrabold flex-shrink-0">{s.step}</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-0.5">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VitalsScan;
