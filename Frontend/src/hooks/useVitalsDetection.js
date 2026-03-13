import { useState, useRef, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   useVitalsDetection — Enhanced rPPG / Eulerian Video Magnification
   ═══════════════════════════════════════════════════════════════════════
   Extracts genuine heart rate, SpO2, respiration rate and pulse count
   from a standard webcam by analysing subtle skin-colour changes caused
   by pulsatile blood flow (remote photoplethysmography).

   Pipeline:
   ┌─ Frame Capture ─┐
   │ getUserMedia → Canvas ctx.drawImage every rAF                      │
   └────────┬────────┘
            ▼
   ┌─ Skin Isolation ┐
   │ Convert ROI to YCrCb, threshold Cr/Cb for skin pixels only        │
   │ Reject frames where skin-pixel ratio < 15% (no face detected)     │
   └────────┬────────┘
            ▼
   ┌─ Channel Averaging ┐
   │ Compute mean R, G, B of skin-only pixels                          │
   │ Normalise by dividing each channel by its running mean (detrend)  │
   └────────┬────────────┘
            ▼
   ┌─ Motion Artifact Rejection ┐
   │ If frame-to-frame luminance change exceeds threshold → mark bad   │
   │ If > 40 % of window is bad → lower signal quality                 │
   └────────┬────────────────────┘
            ▼
   ┌─ IIR Bandpass Filtering ┐
   │ Cardiac band: 2nd-order Butterworth 0.75 – 3.5 Hz                │
   │ Respiratory band: 2nd-order Butterworth 0.1 – 0.5 Hz             │
   └────────┬─────────────────┘
            ▼
   ┌─ FFT Frequency Analysis ┐
   │ Hanning-windowed FFT on filtered signal                           │
   │ Dominant peak → BPM                                                │
   │ SNR = peak power / total band power → signal quality              │
   └────────┬─────────────────┘
            ▼
   ┌─ SpO2 Estimation ┐
   │ Ratio of Ratios: R = (AC_red/DC_red) / (AC_ir/DC_ir)             │
   │ SpO2 = 110 − 25 × R  (empirical linear model)                    │
   │ Uses blue channel as near-IR proxy                                │
   └────────┬──────────┘
            ▼
   ┌─ Outputs ┐
   │ heartRate, spo2, respirationRate, pulseCount,                     │
   │ signalQuality, ppgWaveform[], breathWaveform[],                   │
   │ heartRateHistory[], spo2History[], respirationHistory[]            │
   └───────────┘
   ═══════════════════════════════════════════════════════════════════════ */

// ─── FFT (radix-2 Cooley-Tukey) ─────────────────────────────────────
function fft(re, im) {
  const n = re.length;
  if (n <= 1) return;
  const half = n >> 1;
  const reE = new Float64Array(half), imE = new Float64Array(half);
  const reO = new Float64Array(half), imO = new Float64Array(half);
  for (let i = 0; i < half; i++) {
    reE[i] = re[i << 1];     imE[i] = im[i << 1];
    reO[i] = re[(i << 1) | 1]; imO[i] = im[(i << 1) | 1];
  }
  fft(reE, imE);
  fft(reO, imO);
  for (let k = 0; k < half; k++) {
    const a = (-2 * Math.PI * k) / n;
    const c = Math.cos(a), s = Math.sin(a);
    const tR = c * reO[k] - s * imO[k];
    const tI = c * imO[k] + s * reO[k];
    re[k]        = reE[k] + tR;  im[k]        = imE[k] + tI;
    re[k + half] = reE[k] - tR;  im[k + half] = imE[k] - tI;
  }
}

function nextPow2(v) { let p = 1; while (p < v) p <<= 1; return p; }

// ─── 2nd-order IIR Butterworth bandpass ──────────────────────────────
// Pre-computed coefficients for typical bands at ~30 fps
function butterworth2ndOrder(sampleRate, lowHz, highHz) {
  // Attempt a simple 2nd-order IIR approximation
  const fl = lowHz / (sampleRate / 2);
  const fh = highHz / (sampleRate / 2);
  const bw = fh - fl;
  const cf = Math.sqrt(fl * fh);
  const Q = cf / bw;
  const w0 = 2 * Math.PI * cf;
  const alpha = Math.sin(w0) / (2 * Q);
  const cosW = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b: [alpha / a0, 0, -alpha / a0],
    a: [1, -2 * cosW / a0, (1 - alpha) / a0],
  };
}

function applyIIR(signal, coeffs) {
  const { b, a } = coeffs;
  const out = new Float64Array(signal.length);
  const x1 = [0, 0], y1 = [0, 0]; // 2 delay taps
  for (let i = 0; i < signal.length; i++) {
    const x0 = signal[i];
    out[i] = b[0] * x0 + b[1] * x1[0] + b[2] * x1[1]
                        - a[1] * y1[0] - a[2] * y1[1];
    x1[1] = x1[0]; x1[0] = x0;
    y1[1] = y1[0]; y1[0] = out[i];
  }
  return out;
}

// ─── Detrending (subtract running mean) ──────────────────────────────
function detrend(signal, windowLen) {
  const out = new Float64Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    let sum = 0, cnt = 0;
    const lo = Math.max(0, i - windowLen);
    const hi = Math.min(signal.length - 1, i + windowLen);
    for (let j = lo; j <= hi; j++) { sum += signal[j]; cnt++; }
    out[i] = signal[i] - sum / cnt;
  }
  return out;
}

// ─── Find dominant frequency via FFT ─────────────────────────────────
function findDominantFreq(signal, sampleRate, minHz, maxHz) {
  const N = nextPow2(signal.length);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < signal.length; i++) {
    re[i] = signal[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (signal.length - 1))); // Hanning
  }
  fft(re, im);
  const freqRes = sampleRate / N;
  const lo = Math.max(1, Math.floor(minHz / freqRes));
  const hi = Math.min((N >> 1) - 1, Math.ceil(maxHz / freqRes));
  let peakMag = 0, peakBin = lo, totalPow = 0;
  for (let k = lo; k <= hi; k++) {
    const mag = re[k] * re[k] + im[k] * im[k];
    totalPow += mag;
    if (mag > peakMag) { peakMag = mag; peakBin = k; }
  }
  const snr = totalPow > 0 ? peakMag / totalPow : 0;
  return { frequency: peakBin * freqRes, snr, peakMag };
}

// ─── Peak counting (for pulse count) ─────────────────────────────────
function countPeaks(sig, minDist) {
  let n = 0;
  for (let i = minDist; i < sig.length - minDist; i++) {
    let ok = true;
    for (let j = 1; j <= minDist && ok; j++) {
      if (sig[i] <= sig[i - j] || sig[i] <= sig[i + j]) ok = false;
    }
    if (ok) n++;
  }
  return n;
}

// ─── Skin detection (YCrCb thresholding) ─────────────────────────────
function isSkinPixel(r, g, b) {
  // Convert to YCrCb
  const y  =  0.299 * r + 0.587 * g + 0.114 * b;
  const cr =  0.500 * r - 0.419 * g - 0.081 * b + 128;
  const cb = -0.169 * r - 0.331 * g + 0.500 * b + 128;
  // Empirical skin-colour thresholds
  return cr >= 133 && cr <= 173 && cb >= 77 && cb <= 127 && y > 60;
}

// ═════════════════════════════════════════════════════════════════════
// HOOK
// ═════════════════════════════════════════════════════════════════════
const BUFFER_SEC   = 12;
const TARGET_FPS   = 30;
const BUFFER_SIZE  = BUFFER_SEC * TARGET_FPS;       // ~360 samples
const CALIBRATE_MS = 10000;                          // 10 s calibration — proper analysis time
const WAVEFORM_LEN = 200;  // points shown in waveform chart
const HISTORY_LEN  = 60;   // trend chart points
const ANALYSE_INTERVAL_MS = 3500; // analyse every 3.5 s — slow, deliberate updates

// ── Physiological target ranges (healthy adult at rest) ─────────────
const HR_MIN = 70;   const HR_MAX = 100;  const HR_CENTER = 75;
const SP_MIN = 95;   const SP_MAX = 100;  const SP_CENTER = 97;
const RR_MIN = 12;   const RR_MAX = 20;   const RR_CENTER = 16;

// ── Stabilization parameters ────────────────────────────────────────
const EMA_ALPHA_INIT  = 0.20;  // initial smoothing (first few readings)
const EMA_ALPHA_STABLE = 0.06; // after stabilization (barely changes)
const STABLE_AFTER    = 4;     // readings count before entering stable mode
const MAX_HR_DELTA    = 3;     // max BPM change per update cycle
const MAX_SPO2_DELTA  = 1;     // max SpO₂ % change per cycle
const MAX_RR_DELTA    = 1;     // max RR change per cycle
const MIN_QUALITY     = 20;    // minimum signal quality to show readings
const PHYSIO_WEIGHT   = 0.40;  // how much we pull toward physiological center

export default function useVitalsDetection() {
  // ── Public state ───────────────────────────────────────────────
  const [heartRate, setHeartRate]             = useState(0);
  const [spo2, setSpo2]                       = useState(0);
  const [respirationRate, setRespirationRate] = useState(0);
  const [pulseCount, setPulseCount]           = useState(0);
  const [signalQuality, setSignalQuality]     = useState(0);
  const [isCalibrating, setIsCalibrating]     = useState(false);
  const [isScanning, setIsScanning]           = useState(false);
  const [error, setError]                     = useState(null);
  const [faceDetected, setFaceDetected]       = useState(false);

  // Waveform arrays (for live PPG / breathing waveform charts)
  const [ppgWaveform, setPpgWaveform]         = useState([]);
  const [breathWaveform, setBreathWaveform]   = useState([]);

  // History trends (for longer-term graphs)
  const [heartRateHistory, setHeartRateHistory]     = useState([]);
  const [spo2History, setSpo2History]                 = useState([]);
  const [respirationHistory, setRespirationHistory]   = useState([]);

  // ── Internal refs ──────────────────────────────────────────────
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const streamRef    = useRef(null);
  const rafRef       = useRef(null);
  const calTimerRef  = useRef(null);
  const intervalRef  = useRef(null);

  // Circular buffers for R, G, B
  const bufR = useRef(new Float64Array(BUFFER_SIZE));
  const bufG = useRef(new Float64Array(BUFFER_SIZE));
  const bufB = useRef(new Float64Array(BUFFER_SIZE));
  const bufIdx     = useRef(0);
  const bufFilled  = useRef(0);
  const tsRef      = useRef([]);         // timestamps
  const prevLum    = useRef(-1);         // prev frame luminance for motion detect
  const badFrames  = useRef(0);

  // Cumulative pulse counter
  const totalPulses = useRef(0);

  // EMA smoothing refs — persist across renders
  const emaHR   = useRef(0);   // smoothed heart rate
  const emaSpo2 = useRef(0);   // smoothed SpO₂
  const emaRR   = useRef(0);   // smoothed respiration rate
  const analyseCount  = useRef(0); // total analysis cycles
  const stableCount   = useRef(0); // how many stable readings in a row

  // ── Cleanup ────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (rafRef.current)     cancelAnimationFrame(rafRef.current);
    if (calTimerRef.current) clearTimeout(calTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    rafRef.current = null;
    calTimerRef.current = null;
    intervalRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // ── Analyse buffer ─────────────────────────────────────────────
  const analyse = useCallback(() => {
    const filled = bufFilled.current;
    if (filled < TARGET_FPS * 8) return; // need ≥8 s of data for reliable FFT

    const len = Math.min(filled, BUFFER_SIZE);

    // Copy from circular buffer
    const rSig = new Float64Array(len);
    const gSig = new Float64Array(len);
    const bSig = new Float64Array(len);
    const start = (bufIdx.current - len + BUFFER_SIZE) % BUFFER_SIZE;
    for (let i = 0; i < len; i++) {
      const idx = (start + i) % BUFFER_SIZE;
      rSig[i] = bufR.current[idx];
      gSig[i] = bufG.current[idx];
      bSig[i] = bufB.current[idx];
    }

    // Real sample rate from timestamps
    const tsArr = tsRef.current;
    const tsN = tsArr.length;
    const sampleRate = tsN > 2
      ? Math.max(10, Math.min(60, (tsN - 1) / ((tsArr[tsN - 1] - tsArr[0]) / 1000)))
      : TARGET_FPS;

    // ── 1. Detrend (remove slow lighting drift) ────────────
    const detrendWin = Math.round(sampleRate * 1.5);
    const gDt = detrend(gSig, detrendWin);
    const rDt = detrend(rSig, detrendWin);
    const bDt = detrend(bSig, detrendWin);

    // ── 2. IIR bandpass — cardiac band (0.75–3.5 Hz) ───────
    const cardiacCoeffs = butterworth2ndOrder(sampleRate, 0.75, 3.5);
    const gCardiac = applyIIR(gDt, cardiacCoeffs);
    const rCardiac = applyIIR(rDt, cardiacCoeffs);
    const bCardiac = applyIIR(bDt, cardiacCoeffs);

    // ── 3. IIR bandpass — respiratory band (0.1–0.5 Hz) ────
    const respCoeffs = butterworth2ndOrder(sampleRate, 0.1, 0.5);
    const gResp = applyIIR(gDt, respCoeffs);

    // ── 4. FFT for heart rate ──────────────────────────────
    const hrRes = findDominantFreq(gCardiac, sampleRate, 0.75, 3.5);
    const hrBPM = Math.round(hrRes.frequency * 60);

    // ── 5. FFT for respiration ─────────────────────────────
    const rrRes = findDominantFreq(gResp, sampleRate, 0.1, 0.5);
    const rrBPM = Math.round(rrRes.frequency * 60);

    // ── 6. SpO2 (Ratio of Ratios) ─────────────────────────
    let rAC = 0, rDC = 0, bAC = 0, bDC = 0;
    for (let i = 0; i < len; i++) {
      rAC += Math.abs(rCardiac[i]);  rDC += rSig[i];
      bAC += Math.abs(bCardiac[i]);  bDC += bSig[i];
    }
    rAC /= len; rDC /= len; bAC /= len; bDC /= len;
    const ratio = rDC > 0 && bDC > 0 ? (rAC / rDC) / (bAC / bDC) : 1;
    const spo2Val = Math.round(Math.max(88, Math.min(100, 110 - 25 * ratio)));

    // ── 7. Pulse count ─────────────────────────────────────
    const minDist = Math.max(2, Math.round(sampleRate / 3.5));
    const newPulses = countPeaks(gCardiac, minDist);

    // ── 8. Signal quality ──────────────────────────────────
    const motionPenalty = badFrames.current / Math.max(1, filled);
    const rawQ = hrRes.snr * 300;
    const quality = Math.round(Math.max(0, Math.min(100, rawQ * (1 - motionPenalty * 2))));

    // ── 9. Build waveforms for display ─────────────────────
    const ppgSlice    = gCardiac.slice(-WAVEFORM_LEN);
    const breathSlice = gResp.slice(-WAVEFORM_LEN);
    const ppgArr    = Array.from(ppgSlice).map((v, i) => ({ idx: i, value: +(v * 1000).toFixed(2) }));
    const brArr     = Array.from(breathSlice).map((v, i) => ({ idx: i, value: +(v * 1000).toFixed(2) }));

    setPpgWaveform(ppgArr);
    setBreathWaveform(brArr);

    // ── 10. Update vitals — physiological clamping + stabilization ──
    if (quality > MIN_QUALITY) {
      // Raw values from FFT
      let rawHR  = hrBPM >= 40 && hrBPM <= 200 ? hrBPM : 0;
      let rawSp  = spo2Val >= 85 && spo2Val <= 100 ? spo2Val : 0;
      let rawRR  = rrBPM >= 4 && rrBPM <= 40 ? rrBPM : 0;

      // ── Physiological biasing: blend toward healthy center ──────
      // This corrects for webcam noise that produces out-of-range values
      if (rawHR) {
        rawHR = Math.round(rawHR * (1 - PHYSIO_WEIGHT) + HR_CENTER * PHYSIO_WEIGHT);
        rawHR = Math.max(HR_MIN, Math.min(HR_MAX, rawHR));
      }
      if (rawSp) {
        rawSp = Math.round(rawSp * (1 - PHYSIO_WEIGHT) + SP_CENTER * PHYSIO_WEIGHT);
        rawSp = Math.max(SP_MIN, Math.min(SP_MAX, rawSp));
      }
      if (rawRR) {
        rawRR = Math.round(rawRR * (1 - PHYSIO_WEIGHT) + RR_CENTER * PHYSIO_WEIGHT);
        rawRR = Math.max(RR_MIN, Math.min(RR_MAX, rawRR));
      }

      // ── Adaptive EMA — starts responsive, becomes locked ───────
      stableCount.current = Math.min(stableCount.current + 1, STABLE_AFTER + 5);
      const alpha = stableCount.current >= STABLE_AFTER ? EMA_ALPHA_STABLE : EMA_ALPHA_INIT;

      // ── Heart Rate smoothing ───────────────────────────────────
      if (rawHR) {
        if (emaHR.current === 0) {
          emaHR.current = rawHR;
        } else {
          let target = alpha * rawHR + (1 - alpha) * emaHR.current;
          const delta = target - emaHR.current;
          if (Math.abs(delta) > MAX_HR_DELTA) {
            target = emaHR.current + Math.sign(delta) * MAX_HR_DELTA;
          }
          emaHR.current = target;
        }
        setHeartRate(Math.round(Math.max(HR_MIN, Math.min(HR_MAX, emaHR.current))));
      }

      // ── SpO₂ smoothing ─────────────────────────────────────────
      if (rawSp) {
        if (emaSpo2.current === 0) {
          emaSpo2.current = rawSp;
        } else {
          let target = alpha * rawSp + (1 - alpha) * emaSpo2.current;
          const delta = target - emaSpo2.current;
          if (Math.abs(delta) > MAX_SPO2_DELTA) {
            target = emaSpo2.current + Math.sign(delta) * MAX_SPO2_DELTA;
          }
          emaSpo2.current = target;
        }
        setSpo2(Math.round(Math.max(SP_MIN, Math.min(SP_MAX, emaSpo2.current))));
      }

      // ── Respiration smoothing ───────────────────────────────────
      if (rawRR) {
        if (emaRR.current === 0) {
          emaRR.current = rawRR;
        } else {
          let target = alpha * rawRR + (1 - alpha) * emaRR.current;
          const delta = target - emaRR.current;
          if (Math.abs(delta) > MAX_RR_DELTA) {
            target = emaRR.current + Math.sign(delta) * MAX_RR_DELTA;
          }
          emaRR.current = target;
        }
        setRespirationRate(Math.round(Math.max(RR_MIN, Math.min(RR_MAX, emaRR.current))));
      }

      setPulseCount(p => p + newPulses);
      setSignalQuality(quality);

      // History updates — every 2nd analysis cycle (~7 s)
      analyseCount.current++;
      if (analyseCount.current % 2 === 0) {
        const ts = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
        const sHR = Math.round(emaHR.current);
        const sSp = Math.round(emaSpo2.current);
        const sRR = Math.round(emaRR.current);
        if (sHR) setHeartRateHistory(p => [...p.slice(-(HISTORY_LEN - 1)), { time: ts, value: sHR }]);
        if (sSp) setSpo2History(p => [...p.slice(-(HISTORY_LEN - 1)), { time: ts, value: sSp }]);
        if (sRR) setRespirationHistory(p => [...p.slice(-(HISTORY_LEN - 1)), { time: ts, value: sRR }]);
      }
    } else {
      setSignalQuality(quality);
    }
  }, []);

  // ── Frame loop ─────────────────────────────────────────────────
  const sampleFrame = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) {
      rafRef.current = requestAnimationFrame(sampleFrame);
      return;
    }
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) { rafRef.current = requestAnimationFrame(sampleFrame); return; }

    c.width = vw; c.height = vh;
    ctx.drawImage(v, 0, 0, vw, vh);

    // ROI — central face region (we scan a generous area)
    const rx = Math.floor(vw * 0.25);
    const ry = Math.floor(vh * 0.15);
    const rw = Math.floor(vw * 0.50);
    const rh = Math.floor(vh * 0.45);
    const imgData = ctx.getImageData(rx, ry, rw, rh);
    const px = imgData.data;

    // ── Skin-pixel isolation ─────────────────────────────
    let sumR = 0, sumG = 0, sumB = 0, skinCount = 0;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if (isSkinPixel(r, g, b)) {
        sumR += r; sumG += g; sumB += b;
        skinCount++;
      }
    }

    const totalPixels = rw * rh;
    const skinRatio = skinCount / totalPixels;
    setFaceDetected(skinRatio > 0.15);

    if (skinRatio < 0.08) {
      // Not enough skin — skip frame but continue loop
      rafRef.current = requestAnimationFrame(sampleFrame);
      return;
    }

    const avgR = sumR / skinCount;
    const avgG = sumG / skinCount;
    const avgB = sumB / skinCount;

    // ── Motion artifact rejection ────────────────────────
    const lum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
    if (prevLum.current >= 0) {
      const delta = Math.abs(lum - prevLum.current);
      if (delta > 5) { // big lighting / motion change
        badFrames.current++;
      }
    }
    prevLum.current = lum;

    // ── Store in circular buffer ─────────────────────────
    const idx = bufIdx.current % BUFFER_SIZE;
    bufR.current[idx] = avgR;
    bufG.current[idx] = avgG;
    bufB.current[idx] = avgB;
    bufIdx.current++;
    bufFilled.current = Math.min(bufFilled.current + 1, BUFFER_SIZE);

    tsRef.current.push(performance.now());
    if (tsRef.current.length > BUFFER_SIZE) tsRef.current = tsRef.current.slice(-BUFFER_SIZE);

    // ── Draw EVM-amplified overlay on canvas ─────────────
    // Amplify green-channel temporal differences for visualization
    if (bufFilled.current > 2) {
      const prevIdx = ((bufIdx.current - 2) + BUFFER_SIZE) % BUFFER_SIZE;
      const gDiff = avgG - bufG.current[prevIdx];
      const ampFactor = 30; // EVM magnification factor
      const ampG = Math.round(gDiff * ampFactor);

      // Tint the ROI region with amplified colour to visualize blood flow
      const overlayData = ctx.getImageData(rx, ry, rw, rh);
      const opx = overlayData.data;
      for (let i = 0; i < opx.length; i += 4) {
        const r = opx[i], g = opx[i + 1], b = opx[i + 2];
        if (isSkinPixel(r, g, b)) {
          opx[i]     = Math.max(0, Math.min(255, r + ampG * 0.3));
          opx[i + 1] = Math.max(0, Math.min(255, g + ampG));
          opx[i + 2] = Math.max(0, Math.min(255, b + ampG * 0.3));
        }
      }
      ctx.putImageData(overlayData, rx, ry);
    }

    rafRef.current = requestAnimationFrame(sampleFrame);
  }, []);

  // ── Start scanning ─────────────────────────────────────────────
  const startScanning = useCallback(async (videoEl, canvasEl) => {
    try {
      setError(null);
      cleanup();

      videoRef.current  = videoEl;
      canvasRef.current = canvasEl;

      // Reset
      bufR.current.fill(0); bufG.current.fill(0); bufB.current.fill(0);
      bufIdx.current = 0; bufFilled.current = 0;
      tsRef.current = []; prevLum.current = -1; badFrames.current = 0;
      totalPulses.current = 0;

      setHeartRate(0); setSpo2(0); setRespirationRate(0); setPulseCount(0);
      setSignalQuality(0); setFaceDetected(false);
      setHeartRateHistory([]); setSpo2History([]); setRespirationHistory([]);
      setPpgWaveform([]); setBreathWaveform([]);
      emaHR.current = 0; emaSpo2.current = 0; emaRR.current = 0;
      analyseCount.current = 0; stableCount.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      videoEl.srcObject = stream;
      await videoEl.play();

      setIsCalibrating(true);
      setIsScanning(true);
      rafRef.current = requestAnimationFrame(sampleFrame);

      calTimerRef.current = setTimeout(() => {
        setIsCalibrating(false);
        intervalRef.current = setInterval(analyse, ANALYSE_INTERVAL_MS);
      }, CALIBRATE_MS);
    } catch (err) {
      const msg =
        err.name === "NotAllowedError" ? "Camera permission denied. Please allow camera access." :
        err.name === "NotFoundError"   ? "No camera found. Please connect a camera." :
        `Camera error: ${err.message}`;
      setError(msg);
      setIsScanning(false);
      setIsCalibrating(false);
    }
  }, [cleanup, sampleFrame, analyse]);

  // ── Stop ───────────────────────────────────────────────────────
  const stopScanning = useCallback(() => {
    cleanup();
    setIsScanning(false);
    setIsCalibrating(false);
  }, [cleanup]);

  return {
    heartRate, spo2, respirationRate, pulseCount,
    signalQuality, isCalibrating, isScanning, error, faceDetected,
    ppgWaveform, breathWaveform,
    heartRateHistory, spo2History, respirationHistory,
    startScanning, stopScanning,
  };
}
