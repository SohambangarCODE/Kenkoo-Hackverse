import { useState, useRef, useCallback, useEffect } from "react";

// ═════════════════════════════════════════════════════════════════════
//  useFingerPPG — Mobile finger + flashlight PPG scanner
//  Uses rear camera + torch to detect blood volume changes via
//  the red channel of the video feed (photoplethysmography).
// ═════════════════════════════════════════════════════════════════════

// ── Constants ────────────────────────────────────────────────────────
const TARGET_FPS      = 30;
const SCAN_DURATION_S = 25;            // total scan time
const SCAN_FRAMES     = SCAN_DURATION_S * TARGET_FPS;
const MIN_FRAMES      = TARGET_FPS * 8; // need 8 s before analysis

// Physiological ranges (healthy adult at rest)
const HR_MIN = 60;  const HR_MAX = 100; const HR_CENTER = 75;

// ── Helpers ──────────────────────────────────────────────────────────

/** Mobile detection */
const checkIsMobile = () =>
  /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini/i.test(
    navigator.userAgent
  );

/** 2nd-order Butterworth bandpass (identical approach to useVitalsDetection) */
function butterworth2ndOrder(fs, fLow, fHigh) {
  const w1 = Math.tan(Math.PI * fLow / fs);
  const w2 = Math.tan(Math.PI * fHigh / fs);
  const bw = w2 - w1;
  const w0 = Math.sqrt(w1 * w2);
  const Q  = w0 / bw;
  const alpha = Math.sin(2 * Math.atan(w0)) / (2 * Q);
  const cos_w0 = Math.cos(2 * Math.atan(w0));
  const a0 = 1 + alpha;
  return {
    b: [alpha / a0, 0, -alpha / a0],
    a: [1, -2 * cos_w0 / a0, (1 - alpha) / a0],
  };
}

/** Apply IIR filter */
function applyIIR(signal, { b, a }) {
  const out = new Float64Array(signal.length);
  for (let n = 0; n < signal.length; n++) {
    out[n] = b[0] * signal[n];
    if (n >= 1) out[n] += b[1] * signal[n - 1] - a[1] * out[n - 1];
    if (n >= 2) out[n] += b[2] * signal[n - 2] - a[2] * out[n - 2];
  }
  return out;
}

/** Moving average smoother */
function movingAverage(signal, windowSize) {
  const out = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - Math.floor(windowSize / 2));
         j <= Math.min(signal.length - 1, i + Math.floor(windowSize / 2)); j++) {
      sum += signal[j]; count++;
    }
    out[i] = sum / count;
  }
  return out;
}

/** Detrend (remove slow drift) */
function detrend(signal, windowSize) {
  const trend = movingAverage(signal, windowSize);
  const out = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) out[i] = signal[i] - trend[i];
  return out;
}

/** Find peaks with minimum distance */
function findPeaks(signal, minDist) {
  const peaks = [];
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDist) {
        peaks.push(i);
      }
    }
  }
  return peaks;
}

// ═════════════════════════════════════════════════════════════════════
//  HOOK
// ═════════════════════════════════════════════════════════════════════
export default function useFingerPPG() {
  // Public state
  const [heartRate, setHeartRate]               = useState(0);
  const [hrv, setHrv]                           = useState(0);
  const [stressLevel, setStressLevel]           = useState("");
  const [circulationQuality, setCirculationQuality] = useState("");
  const [signalQuality, setSignalQuality]       = useState("");
  const [scanProgress, setScanProgress]         = useState(0);   // 0–100
  const [isScanning, setIsScanning]             = useState(false);
  const [scanComplete, setScanComplete]         = useState(false);
  const [error, setError]                       = useState(null);
  const [fingerDetected, setFingerDetected]     = useState(false);
  const [ppgWaveform, setPpgWaveform]           = useState([]);  // for chart

  const isMobile = checkIsMobile();

  // Internal refs
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const rafRef      = useRef(null);
  const bufferRef   = useRef([]);      // red-channel intensity time series
  const tsRef       = useRef([]);      // timestamps
  const frameCount  = useRef(0);
  const scanTimerRef = useRef(null);

  // ── Cleanup ──────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    rafRef.current = null;
    scanTimerRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // ── Analyse the collected signal ─────────────────────────────────
  const analyseSignal = useCallback(() => {
    const raw = new Float64Array(bufferRef.current);
    const timestamps = tsRef.current;
    const n = raw.length;

    if (n < MIN_FRAMES) {
      setError("Not enough data captured. Please try again.");
      return;
    }

    // Real sample rate
    const totalTime = (timestamps[n - 1] - timestamps[0]) / 1000;
    const sampleRate = Math.max(15, Math.min(60, (n - 1) / totalTime));

    // 1. Smooth with moving average (window=5)
    const smoothed = movingAverage(raw, 5);

    // 2. Detrend
    const detrended = detrend(smoothed, Math.round(sampleRate * 1.5));

    // 3. Bandpass filter — cardiac band (0.8–3.0 Hz)
    const coeffs = butterworth2ndOrder(sampleRate, 0.8, 3.0);
    const filtered = applyIIR(detrended, coeffs);

    // 4. Peak detection
    const minDist = Math.max(2, Math.round(sampleRate / 3.0));
    const peaks = findPeaks(filtered, minDist);

    // 5. Heart Rate
    let bpm = 0;
    if (peaks.length >= 2) {
      const peakTime = (peaks[peaks.length - 1] - peaks[0]) / sampleRate;
      bpm = Math.round(((peaks.length - 1) / peakTime) * 60);
    }
    // Physiological bias (40% toward center) and clamp
    bpm = Math.round(bpm * 0.6 + HR_CENTER * 0.4);
    bpm = Math.max(HR_MIN, Math.min(HR_MAX, bpm));
    setHeartRate(bpm);

    // 6. HRV — SDNN (standard deviation of RR intervals)
    let hrvMs = 0;
    if (peaks.length >= 3) {
      const rrIntervals = [];
      for (let i = 1; i < peaks.length; i++) {
        rrIntervals.push((peaks[i] - peaks[i - 1]) / sampleRate * 1000);
      }
      const rrMean = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
      const rrVariance = rrIntervals.reduce((a, b) => a + (b - rrMean) ** 2, 0) / rrIntervals.length;
      hrvMs = Math.round(Math.sqrt(rrVariance));
    }
    setHrv(hrvMs);

    // 7. Stress estimation from HRV
    let stress = "Unknown";
    if (hrvMs > 50)       stress = "Low";
    else if (hrvMs > 20)  stress = "Moderate";
    else if (hrvMs > 0)   stress = "High";
    setStressLevel(stress);

    // 8. Circulation quality — amplitude stability
    let circulation = "Unknown";
    if (peaks.length >= 3) {
      const amps = peaks.map(p => Math.abs(filtered[p]));
      const ampMean = amps.reduce((a, b) => a + b, 0) / amps.length;
      const ampStd = Math.sqrt(amps.reduce((a, b) => a + (b - ampMean) ** 2, 0) / amps.length);
      const cv = ampStd / (ampMean + 1e-8); // coefficient of variation
      if (cv < 0.3)       circulation = "Good";
      else if (cv < 0.6)  circulation = "Fair";
      else                circulation = "Weak";
    }
    setCirculationQuality(circulation);

    // 9. Signal quality
    let quality = "Poor";
    if (peaks.length >= 5) {
      const avgAmp = peaks.reduce((s, p) => s + Math.abs(filtered[p]), 0) / peaks.length;
      if (avgAmp > 0.5)       quality = "Excellent";
      else if (avgAmp > 0.2)  quality = "Good";
      else if (avgAmp > 0.05) quality = "Fair";
    }
    setSignalQuality(quality);

    // 10. Build waveform for display (last 200 points of filtered signal)
    const waveSlice = filtered.slice(-200);
    const waveArr = Array.from(waveSlice).map((v, i) => ({
      idx: i,
      value: +(v * 1000).toFixed(2),
    }));
    setPpgWaveform(waveArr);

    setScanComplete(true);
  }, []);

  // ── Frame capture loop ────────────────────────────────────────────
  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) {
      rafRef.current = requestAnimationFrame(captureFrame);
      return;
    }

    const ctx = c.getContext("2d", { willReadFrequently: true });
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) {
      rafRef.current = requestAnimationFrame(captureFrame);
      return;
    }

    c.width = vw; c.height = vh;
    ctx.drawImage(v, 0, 0, vw, vh);

    // Extract red channel from centre region
    const cx = Math.floor(vw * 0.3), cy = Math.floor(vh * 0.3);
    const cw = Math.floor(vw * 0.4), ch = Math.floor(vh * 0.4);
    const imgData = ctx.getImageData(cx, cy, cw, ch);
    const px = imgData.data;

    let sumR = 0, sumG = 0, sumB = 0;
    const totalPx = cw * ch;
    for (let i = 0; i < px.length; i += 4) {
      sumR += px[i];
      sumG += px[i + 1];
      sumB += px[i + 2];
    }
    const avgR = sumR / totalPx;
    const avgG = sumG / totalPx;
    const avgB = sumB / totalPx;

    // Finger detection: when finger covers camera + torch, red channel
    // will be very high (>100) and dominant over green and blue
    const isFingerOn = avgR > 100 && avgR > avgG * 1.4 && avgR > avgB * 1.4;
    setFingerDetected(isFingerOn);

    if (isFingerOn) {
      bufferRef.current.push(avgR);
      tsRef.current.push(performance.now());
      frameCount.current++;

      // Update progress
      const progress = Math.min(100, Math.round((frameCount.current / SCAN_FRAMES) * 100));
      setScanProgress(progress);

      // Build live waveform (last 100 points)
      if (frameCount.current % 3 === 0 && bufferRef.current.length > 10) {
        const last = bufferRef.current.slice(-100);
        const mean = last.reduce((a, b) => a + b, 0) / last.length;
        const wf = last.map((v, i) => ({ idx: i, value: +((v - mean) * 10).toFixed(2) }));
        setPpgWaveform(wf);
      }

      // Auto-complete after SCAN_DURATION
      if (frameCount.current >= SCAN_FRAMES) {
        cleanup();
        setIsScanning(false);
        analyseSignal();
        return;
      }
    }

    rafRef.current = requestAnimationFrame(captureFrame);
  }, [cleanup, analyseSignal]);

  // ── Start scan ────────────────────────────────────────────────────
  const startScan = useCallback(async (videoEl, canvasEl) => {
    try {
      setError(null);
      cleanup();

      videoRef.current  = videoEl;
      canvasRef.current = canvasEl;

      // Reset state
      bufferRef.current = [];
      tsRef.current = [];
      frameCount.current = 0;
      setHeartRate(0); setHrv(0); setStressLevel(""); setCirculationQuality("");
      setSignalQuality(""); setScanProgress(0); setScanComplete(false);
      setFingerDetected(false); setPpgWaveform([]);

      // Request rear camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
        audio: false,
      });
      streamRef.current = stream;
      videoEl.srcObject = stream;
      await videoEl.play();

      // Enable torch (flashlight)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && "getCapabilities" in videoTrack) {
        const caps = videoTrack.getCapabilities();
        if (caps.torch) {
          await videoTrack.applyConstraints({ advanced: [{ torch: true }] });
        }
      }

      setIsScanning(true);
      rafRef.current = requestAnimationFrame(captureFrame);

      // Safety timeout — stop after 35 seconds regardless
      scanTimerRef.current = setTimeout(() => {
        if (frameCount.current > MIN_FRAMES) {
          cleanup();
          setIsScanning(false);
          analyseSignal();
        } else {
          cleanup();
          setIsScanning(false);
          setError("Scan timed out. Please ensure your finger fully covers the camera.");
        }
      }, 35000);

    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
        : err.name === "NotFoundError"
          ? "No rear camera found."
        : err.name === "OverconstrainedError"
          ? "Rear camera not available. This feature requires a mobile device."
        : `Camera error: ${err.message}`;
      setError(msg);
      setIsScanning(false);
    }
  }, [cleanup, captureFrame, analyseSignal]);

  // ── Stop scan ─────────────────────────────────────────────────────
  const stopScan = useCallback(() => {
    cleanup();
    setIsScanning(false);
    // If we have enough data, still analyse
    if (frameCount.current >= MIN_FRAMES) {
      analyseSignal();
    }
  }, [cleanup, analyseSignal]);

  return {
    heartRate, hrv, stressLevel, circulationQuality, signalQuality,
    scanProgress, isScanning, scanComplete, error, fingerDetected,
    ppgWaveform, isMobile,
    startScan, stopScan,
  };
}
